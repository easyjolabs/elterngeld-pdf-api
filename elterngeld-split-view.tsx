import { useState, useRef, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

// ============================================
// TYPES
// ============================================

type MonthPlan = {
    parent1Type: "basis" | "plus" | "none"
    parent2Type: "basis" | "plus" | "partnership" | "none"
}

// ============================================
// DATE UTILITIES
// ============================================

const formatDate = (date: Date, formatStr: string): string => {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    if (formatStr === "PPP") {
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    }
    if (formatStr === "MMMM yyyy") {
        return `${months[date.getMonth()]} ${date.getFullYear()}`
    }
    if (formatStr === "d") {
        return date.getDate().toString()
    }
    return date.toLocaleDateString()
}

const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

const isSameMonth = (date1: Date, date2: Date): boolean => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth()
    )
}

const getDaysInMonth = (year: number, month: number): Date[] => {
    const days: Date[] = []
    const date = new Date(year, month, 1)
    while (date.getMonth() === month) {
        days.push(new Date(date))
        date.setDate(date.getDate() + 1)
    }
    return days
}

// ============================================
// CUSTOM CALENDAR COMPONENT
// ============================================

type CalendarProps = {
    selected: Date | undefined
    onSelect: (date: Date | undefined) => void
}

function Calendar({ selected, onSelect }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(selected || new Date())

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = new Date(year, month, 1)
    const startDayOfWeek = firstDay.getDay()
    const daysFromPrevMonth = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1

    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()

    const prevMonthDays = Array.from({ length: daysFromPrevMonth }, (_, i) => {
        return new Date(prevYear, prevMonth, daysInPrevMonth - daysFromPrevMonth + i + 1)
    })

    const totalCells = prevMonthDays.length + daysInMonth.length
    const nextMonthDaysCount = 42 - totalCells
    const nextMonth = month === 11 ? 0 : month + 1
    const nextYear = month === 11 ? year + 1 : year

    const nextMonthDays = Array.from({ length: nextMonthDaysCount }, (_, i) => {
        return new Date(nextYear, nextMonth, i + 1)
    })

    const allDays = [...prevMonthDays, ...daysInMonth, ...nextMonthDays]
    const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1))
    }

    const goToNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1))
    }

    return (
        <div style={{ width: 280 }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <Button
                    onClick={goToPrevMonth}
                    variant="ghost"
                    size="sm"
                    style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        fontSize: 14,
                    }}
                >
                    ←
                </Button>
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#111827",
                    }}
                >
                    {formatDate(currentMonth, "MMMM yyyy")}
                </div>
                <Button
                    onClick={goToNextMonth}
                    variant="ghost"
                    size="sm"
                    style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        fontSize: 14,
                    }}
                >
                    →
                </Button>
            </div>

            {/* Week days */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 4,
                    marginBottom: 8,
                }}
            >
                {weekDays.map((day) => (
                    <div
                        key={day}
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#9ca3af",
                            textAlign: "center",
                            padding: 4,
                        }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: 4,
                }}
            >
                {allDays.map((day, index) => {
                    const isCurrentMonth = isSameMonth(day, currentMonth)
                    const isSelected = selected && isSameDay(day, selected)
                    const isToday = isSameDay(day, new Date())

                    return (
                        <button
                            key={index}
                            onClick={() => onSelect(day)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                border: "none",
                                background: isSelected
                                    ? "#FF6B35"
                                    : isToday
                                    ? "#f3f4f6"
                                    : "transparent",
                                color: isSelected
                                    ? "#ffffff"
                                    : isCurrentMonth
                                    ? "#111827"
                                    : "#d1d5db",
                                fontSize: 13,
                                fontWeight: isSelected ? 600 : 400,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = "#f9fafb"
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = isToday
                                        ? "#f3f4f6"
                                        : "transparent"
                                }
                            }}
                        >
                            {formatDate(day, "d")}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

// ============================================
// SHADCN-STYLE UI COMPONENTS
// ============================================

// Button Component
type ButtonProps = {
    children: React.ReactNode
    onClick?: () => void
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg"
    disabled?: boolean
    style?: React.CSSProperties
}

function Button({
    children,
    onClick,
    variant = "default",
    size = "default",
    disabled = false,
    style = {},
}: ButtonProps) {
    const baseStyles: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        transition: "all 0.15s ease",
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        outline: "none",
        opacity: disabled ? 0.5 : 1,
    }

    const sizeStyles: Record<string, React.CSSProperties> = {
        sm: { height: 36, padding: "0 12px", fontSize: 13 },
        default: { height: 44, padding: "0 20px", fontSize: 14 },
        lg: { height: 52, padding: "0 28px", fontSize: 15 },
    }

    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            background: "#FF6B35",
            color: "#ffffff",
        },
        outline: {
            background: "#ffffff",
            color: "#FF6B35",
            border: "1.5px solid #FF6B35",
        },
        ghost: {
            background: "transparent",
            color: "#111827",
        },
    }

    const [isHovered, setIsHovered] = useState(false)

    const hoverStyles: Record<string, React.CSSProperties> = {
        default: { background: "#e55a26" },
        outline: { background: "#fff5f2" },
        ghost: { background: "#f9fafb" },
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                ...baseStyles,
                ...sizeStyles[size],
                ...variantStyles[variant],
                ...(isHovered && !disabled ? hoverStyles[variant] : {}),
                ...style,
            }}
        >
            {children}
        </button>
    )
}

// Checkbox Component
type CheckboxProps = {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    disabled?: boolean
}

function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
    return (
        <label
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
            }}
        >
            <div
                onClick={() => !disabled && onChange(!checked)}
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `2px solid ${checked ? "#FF6B35" : "#d1d5db"}`,
                    background: checked ? "#FF6B35" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                }}
            >
                {checked && (
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M10 3L4.5 8.5L2 6"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </div>
            {label && (
                <span
                    style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#111827",
                    }}
                >
                    {label}
                </span>
            )}
        </label>
    )
}

// Slider Component
type SliderProps = {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
    disabled?: boolean
}

function Slider({
    value,
    onChange,
    min = 0,
    max = 100,
    step = 1,
    disabled = false,
}: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: 44,
                display: "flex",
                alignItems: "center",
            }}
        >
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 3,
                    appearance: "none",
                    background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
                    outline: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1,
                }}
            />
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FF6B35;
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FF6B35;
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
                }
            `}</style>
        </div>
    )
}

// ============================================
// ELTERNGELD CALCULATOR COMPONENT
// ============================================

function ElterngeldCalculator() {
    const [currentStep, setCurrentStep] = useState<1 | 2>(1)
    const [income, setIncome] = useState(0)
    const [siblingBonus, setSiblingBonus] = useState(false)
    const [multipleChildren, setMultipleChildren] = useState(false)
    const [numberOfChildren, setNumberOfChildren] = useState(1)
    const [childBirthDate, setChildBirthDate] = useState<Date | undefined>(
        undefined
    )
    const [isCalendarOpen, setIsCalendarOpen] = useState(false)
    const [isSingleParent, setIsSingleParent] = useState(false)
    const [monthPlans, setMonthPlans] = useState<MonthPlan[]>(
        Array.from({ length: 36 }, () => ({
            parent1Type: "none",
            parent2Type: "none",
        }))
    )
    const [visibleMonths, setVisibleMonths] = useState(14)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const calendarRef = useRef<HTMLDivElement>(null)
    const SLIDER_MAX = 7000

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                calendarRef.current &&
                !calendarRef.current.contains(event.target as Node)
            ) {
                setIsCalendarOpen(false)
            }
        }

        if (isCalendarOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isCalendarOpen])

    const calculateAllowance = () => {
        const annualIncome = income * 12
        if (annualIncome > 175000) {
            return { basis: 0, plus: 0, isOverLimit: true, isMax: false }
        }
        let basis = income * 0.65
        const isMax = basis >= 1800
        if (basis > 1800) basis = 1800
        if (basis < 300) basis = 300
        if (siblingBonus) {
            basis = Math.max(basis * 1.1, basis + 75)
        }
        if (multipleChildren && numberOfChildren > 1) {
            basis += (numberOfChildren - 1) * 300
        }
        const plus = basis / 2
        return {
            basis: Math.round(basis),
            plus: Math.round(plus),
            isOverLimit: false,
            isMax,
        }
    }

    const result = calculateAllowance()

    const toggleCheckbox = (
        monthIndex: number,
        parent: 1 | 2,
        type: "basis" | "plus"
    ) => {
        const newPlans = [...monthPlans]
        const plan = newPlans[monthIndex]
        const key = parent === 1 ? "parent1Type" : "parent2Type"
        if (plan[key] === type) {
            plan[key] = "none"
        } else {
            plan[key] = type
        }
        setMonthPlans(newPlans)
    }

    const computeMonthTotal = (plan: MonthPlan): number => {
        let total = 0
        if (plan.parent1Type === "basis") total += result.basis
        if (plan.parent1Type === "plus") total += result.plus
        if (plan.parent2Type === "basis") total += result.basis
        if (plan.parent2Type === "plus") total += result.plus
        return total
    }

    const getMonthDateRange = (monthIndex: number): string | null => {
        if (!childBirthDate) return null
        const startDate = new Date(childBirthDate)
        startDate.setMonth(startDate.getMonth() + monthIndex)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1)
        const formatShort = (d: Date) =>
            `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
        return `${formatShort(startDate)}-${formatShort(endDate)}`
    }

    const hasValidationErrors = (() => {
        if (isSingleParent) return false
        for (let i = 0; i < visibleMonths; i++) {
            const plan = monthPlans[i]
            if (plan.parent1Type === "basis" && plan.parent2Type === "basis") {
                return true
            }
        }
        return false
    })()

    const canAddMoreMonths = visibleMonths < 36

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 640,
                    height: "100%",
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    boxSizing: "border-box",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "24px 32px",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexShrink: 0,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: currentStep === 1 ? "#FF6B35" : "#e5e7eb",
                                transition: "all 0.2s ease",
                            }}
                        />
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: currentStep === 2 ? "#FF6B35" : "#e5e7eb",
                                transition: "all 0.2s ease",
                            }}
                        />
                    </div>
                    <h2
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#111827",
                            margin: 0,
                            flex: 1,
                            textAlign: "center",
                        }}
                    >
                        {currentStep === 1 ? "Calculate Benefits" : "Plan Your Months"}
                    </h2>
                    <div style={{ width: 40 }} />
                </div>

                {/* Content Area - Fixed height to prevent jumping */}
                <div
                    style={{
                        flex: 1,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                    }}
                >
                    {currentStep === 1 ? (
                        /* STEP 1: Calculator */
                        <div
                            style={{
                                padding: "32px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 24,
                                height: "100%",
                                overflowY: "auto",
                            }}
                        >
                            {/* Income Section */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <h3
                                        style={{
                                            fontSize: 15,
                                            fontWeight: 600,
                                            color: "#111827",
                                            margin: "0 0 4px 0",
                                        }}
                                    >
                                        Monthly Net Income
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: 13,
                                            color: "#6b7280",
                                            margin: 0,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Average over 12 months before birth
                                    </p>
                                </div>

                                <Slider
                                    value={income}
                                    onChange={setIncome}
                                    min={0}
                                    max={SLIDER_MAX}
                                    step={50}
                                />

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                    }}
                                >
                                    <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
                                        €0
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 20,
                                            color: "#111827",
                                            fontWeight: 700,
                                        }}
                                    >
                                        €{income.toLocaleString("de-DE")}
                                    </span>
                                    <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>
                                        €{SLIDER_MAX.toLocaleString("de-DE")}
                                    </span>
                                </div>
                            </div>

                            {/* Bonuses Section */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Checkbox
                                    checked={siblingBonus}
                                    onChange={setSiblingBonus}
                                    label="Sibling bonus"
                                />
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#6b7280",
                                        margin: "-8px 0 0 30px",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    At least one child under 3, or two under 6
                                </p>

                                <Checkbox
                                    checked={multipleChildren}
                                    onChange={setMultipleChildren}
                                    label="Multiple births"
                                />
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#6b7280",
                                        margin: "-8px 0 0 30px",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    Twins, triplets, or more
                                </p>

                                {multipleChildren && (
                                    <div style={{ marginLeft: 30 }}>
                                        <select
                                            value={numberOfChildren}
                                            onChange={(e) =>
                                                setNumberOfChildren(Number(e.target.value))
                                            }
                                            style={{
                                                padding: "10px 12px",
                                                fontSize: 14,
                                                border: "1.5px solid #e5e7eb",
                                                borderRadius: 8,
                                                backgroundColor: "#ffffff",
                                                cursor: "pointer",
                                                width: "100%",
                                                maxWidth: 200,
                                                color: "#111827",
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5].map((num) => (
                                                <option key={num} value={num}>
                                                    {num} {num === 1 ? "child" : "children"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Results Card */}
                            <div
                                style={{
                                    marginTop: "auto",
                                    padding: 24,
                                    background: "#f9fafb",
                                    borderRadius: 12,
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                {result.isOverLimit ? (
                                    <div style={{ textAlign: "center" }}>
                                        <p style={{ fontSize: 14, color: "#dc2626", margin: 0 }}>
                                            Income exceeds €175,000 annual limit
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                                                Basiselterngeld
                                            </span>
                                            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                                €{result.basis.toLocaleString("de-DE")}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                height: 1,
                                                background: "#e5e7eb",
                                            }}
                                        />
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>
                                                ElterngeldPlus
                                            </span>
                                            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                                €{result.plus.toLocaleString("de-DE")}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom Action */}
                            <Button
                                onClick={() => setCurrentStep(2)}
                                style={{ width: "100%" }}
                            >
                                Continue to Planning
                            </Button>
                        </div>
                    ) : (
                        /* STEP 2: Planner */
                        <div
                            style={{
                                padding: "32px",
                                display: "flex",
                                flexDirection: "column",
                                gap: 24,
                                height: "100%",
                            }}
                        >
                            {/* Child Info */}
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                                <div
                                    ref={calendarRef}
                                    style={{
                                        position: "relative",
                                        flex: "1 1 200px",
                                    }}
                                >
                                    <button
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                        style={{
                                            width: "100%",
                                            height: 44,
                                            padding: "0 16px",
                                            borderRadius: 8,
                                            border: "1.5px solid #e5e7eb",
                                            background: "#ffffff",
                                            fontSize: 14,
                                            color: childBirthDate ? "#111827" : "#9ca3af",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {childBirthDate
                                            ? formatDate(childBirthDate, "PPP")
                                            : "Child's birthday"}
                                    </button>
                                    {isCalendarOpen && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "calc(100% + 8px)",
                                                left: 0,
                                                zIndex: 1000,
                                                background: "#ffffff",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: 12,
                                                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                                                padding: 16,
                                            }}
                                        >
                                            <Calendar
                                                selected={childBirthDate}
                                                onSelect={(date) => {
                                                    setChildBirthDate(date)
                                                    setIsCalendarOpen(false)
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div
                                    style={{
                                        flex: "0 0 auto",
                                        padding: "0 16px",
                                        height: 44,
                                        borderRadius: 8,
                                        border: "1.5px solid #e5e7eb",
                                        background: "#ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Checkbox
                                        checked={isSingleParent}
                                        onChange={setIsSingleParent}
                                        label="Single parent"
                                    />
                                </div>
                            </div>

                            {/* Month Planner */}
                            <div
                                style={{
                                    flex: 1,
                                    overflow: "hidden",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                }}
                            >
                                <h3
                                    style={{
                                        fontSize: 15,
                                        fontWeight: 600,
                                        color: "#111827",
                                        margin: 0,
                                    }}
                                >
                                    Plan each month
                                </h3>

                                <div
                                    ref={scrollContainerRef}
                                    style={{
                                        flex: 1,
                                        overflowX: "auto",
                                        overflowY: "hidden",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            gap: 12,
                                            paddingBottom: 12,
                                        }}
                                    >
                                        {monthPlans.slice(0, visibleMonths).map((plan, index) => {
                                            const amount = computeMonthTotal(plan)
                                            const dateRange = getMonthDateRange(index)
                                            const hasError =
                                                hasValidationErrors &&
                                                !isSingleParent &&
                                                plan.parent1Type === "basis" &&
                                                plan.parent2Type === "basis"

                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        width: 140,
                                                        flex: "0 0 auto",
                                                        border: hasError
                                                            ? "2px solid #dc2626"
                                                            : "1.5px solid #e5e7eb",
                                                        borderRadius: 12,
                                                        padding: 16,
                                                        background: hasError ? "#fef2f2" : "#ffffff",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 16,
                                                    }}
                                                >
                                                    {/* Month Header */}
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 15,
                                                                fontWeight: 700,
                                                                color: "#111827",
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            Month {index + 1}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#9ca3af",
                                                            }}
                                                        >
                                                            {dateRange || "—"}
                                                        </div>
                                                    </div>

                                                    {/* Checkboxes */}
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontSize: 11,
                                                                    color: "#6b7280",
                                                                    marginBottom: 8,
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                You
                                                            </div>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                                <Checkbox
                                                                    checked={plan.parent1Type === "basis"}
                                                                    onChange={() =>
                                                                        toggleCheckbox(index, 1, "basis")
                                                                    }
                                                                    label="Basis"
                                                                />
                                                                <Checkbox
                                                                    checked={plan.parent1Type === "plus"}
                                                                    onChange={() =>
                                                                        toggleCheckbox(index, 1, "plus")
                                                                    }
                                                                    label="Plus"
                                                                />
                                                            </div>
                                                        </div>

                                                        {!isSingleParent && (
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        fontSize: 11,
                                                                        color: "#6b7280",
                                                                        marginBottom: 8,
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    Partner
                                                                </div>
                                                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                                    <Checkbox
                                                                        checked={plan.parent2Type === "basis"}
                                                                        onChange={() =>
                                                                            toggleCheckbox(index, 2, "basis")
                                                                        }
                                                                        label="Basis"
                                                                    />
                                                                    <Checkbox
                                                                        checked={plan.parent2Type === "plus"}
                                                                        onChange={() =>
                                                                            toggleCheckbox(index, 2, "plus")
                                                                        }
                                                                        label="Plus"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Amount */}
                                                    {amount > 0 && (
                                                        <div
                                                            style={{
                                                                marginTop: "auto",
                                                                paddingTop: 12,
                                                                borderTop: "1px solid #e5e7eb",
                                                                fontSize: 16,
                                                                fontWeight: 700,
                                                                color: "#FF6B35",
                                                            }}
                                                        >
                                                            €{amount.toLocaleString("de-DE")}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        {canAddMoreMonths && (
                                            <button
                                                onClick={() => setVisibleMonths(visibleMonths + 6)}
                                                style={{
                                                    width: 140,
                                                    flex: "0 0 auto",
                                                    border: "1.5px dashed #d1d5db",
                                                    borderRadius: 12,
                                                    padding: 16,
                                                    background: "transparent",
                                                    cursor: "pointer",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 24,
                                                    color: "#9ca3af",
                                                }}
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Error Message */}
                                {hasValidationErrors && (
                                    <div
                                        style={{
                                            padding: 12,
                                            background: "#fef2f2",
                                            border: "1px solid #fecaca",
                                            borderRadius: 8,
                                            fontSize: 13,
                                            color: "#dc2626",
                                        }}
                                    >
                                        Both parents cannot claim Basis in the same month
                                    </div>
                                )}
                            </div>

                            {/* Bottom Actions */}
                            <div style={{ display: "flex", gap: 12 }}>
                                <Button
                                    onClick={() => setCurrentStep(1)}
                                    variant="outline"
                                    style={{ flex: 1 }}
                                >
                                    Back
                                </Button>
                                <Button style={{ flex: 1 }}>
                                    Start Application
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Disclaimer */}
                <div
                    style={{
                        padding: "16px 32px",
                        borderTop: "1px solid #e5e7eb",
                        fontSize: 11,
                        color: "#6b7280",
                        textAlign: "center",
                        lineHeight: 1.5,
                        flexShrink: 0,
                    }}
                >
                    This is an estimate. Final amounts may vary based on your specific situation.
                </div>
            </div>
        </div>
    )
}

export default function ElterngeldSplitView() {
    return <ElterngeldCalculator />
}

addPropertyControls(ElterngeldSplitView, {})
