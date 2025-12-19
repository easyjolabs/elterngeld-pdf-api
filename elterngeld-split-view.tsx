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
                    marginBottom: 12,
                }}
            >
                <Button
                    onClick={goToPrevMonth}
                    variant="ghost"
                    style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        border: "1px solid #e1e1e1",
                        borderRadius: 6,
                        fontSize: 16,
                    }}
                >
                    ←
                </Button>
                <div
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1a1a1a",
                    }}
                >
                    {formatDate(currentMonth, "MMMM yyyy")}
                </div>
                <Button
                    onClick={goToNextMonth}
                    variant="ghost"
                    style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        border: "1px solid #e1e1e1",
                        borderRadius: 6,
                        fontSize: 16,
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
                    marginBottom: 4,
                }}
            >
                {weekDays.map((day) => (
                    <div
                        key={day}
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "#6b7280",
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
                                    ? "#f0f0f0"
                                    : "transparent",
                                color: isSelected
                                    ? "#ffffff"
                                    : isCurrentMonth
                                    ? "#1a1a1a"
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
                                    e.currentTarget.style.background = "#f5f5f5"
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) {
                                    e.currentTarget.style.background = isToday
                                        ? "#f0f0f0"
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
    className?: string
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
        borderRadius: 10,
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
        default: { height: 48, padding: "0 24px", fontSize: 14 },
        lg: { height: 56, padding: "0 32px", fontSize: 16 },
    }

    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            background: "#FF6B35",
            color: "#ffffff",
        },
        outline: {
            background: "#ffffff",
            color: "#FF6B35",
            border: "2px solid #FF6B35",
        },
        ghost: {
            background: "transparent",
            color: "#1a1a1a",
        },
    }

    const [isHovered, setIsHovered] = useState(false)

    const hoverStyles: Record<string, React.CSSProperties> = {
        default: { background: "#e55a26" },
        outline: { background: "#fff5f2" },
        ghost: { background: "#f5f5f5" },
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
                gap: 8,
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
                    border: `2px solid ${checked ? "#FF6B35" : "#e1e1e1"}`,
                    background: checked ? "#FF6B35" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
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
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a1a1a",
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
                height: 40,
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
                    background: `linear-gradient(to right, #FF6B35 0%, #FF6B35 ${percentage}%, #e1e1e1 ${percentage}%, #e1e1e1 100%)`,
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
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #FF6B35;
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    )
}

// Card Component
type CardProps = {
    children: React.ReactNode
    onClick?: () => void
    style?: React.CSSProperties
    hover?: boolean
}

function Card({ children, onClick, style = {}, hover = false }: CardProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                background: "#ffffff",
                border: "1px solid #e1e1e1",
                borderRadius: 10,
                padding: 16,
                transition: "all 0.15s ease",
                cursor: onClick ? "pointer" : "default",
                ...(hover && isHovered
                    ? {
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          borderColor: "#d1d5db",
                      }
                    : {}),
                ...style,
            }}
        >
            {children}
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

    const triggerVoiceflowChat = (prompt: string) => {
        try {
            if (typeof (window as any).sendToVoiceflow === "function") {
                ;(window as any).sendToVoiceflow(prompt)
            } else {
                sessionStorage.setItem("vf_initial_message", prompt)
                window.location.reload()
            }
        } catch (e) {
            console.error("Chat trigger error:", e)
        }
    }

    const toggleCheckbox = (
        monthIndex: number,
        parent: 1 | 2,
        desired: "basis" | "plus"
    ) => {
        setMonthPlans((prev) => {
            const next = [...prev]
            const current = next[monthIndex]
            if (parent === 1) {
                const nextType =
                    current.parent1Type === desired ? "none" : desired
                next[monthIndex] = { ...current, parent1Type: nextType }
            } else {
                const nextType =
                    current.parent2Type === desired ? "none" : desired
                next[monthIndex] = { ...current, parent2Type: nextType as any }
            }
            return next
        })
    }

    const computeMonthTotal = (plan: MonthPlan) => {
        const p1 =
            plan.parent1Type === "basis"
                ? result.basis
                : plan.parent1Type === "plus"
                  ? result.plus
                  : 0
        const p2 =
            plan.parent2Type === "basis" || plan.parent2Type === "partnership"
                ? result.basis
                : plan.parent2Type === "plus"
                  ? result.plus
                  : 0
        return p1 + p2
    }

    const getMonthDateRange = (monthIndex: number) => {
        if (!childBirthDate) return ""
        const birthDate = new Date(childBirthDate)
        const startDate = new Date(birthDate)
        startDate.setMonth(startDate.getMonth() + monthIndex)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1)
        const formatDate = (date: Date) => {
            const day = date.getDate().toString().padStart(2, "0")
            const month = (date.getMonth() + 1).toString().padStart(2, "0")
            return `${day}.${month}`
        }
        return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }

    const validateMonths = () => {
        const errors: string[] = []
        const parent1BasisMonths = monthPlans.filter(
            (m) => m.parent1Type === "basis"
        ).length
        const parent2BasisMonths = monthPlans.filter(
            (m) => m.parent2Type === "basis"
        ).length
        const totalBasisMonths = parent1BasisMonths + parent2BasisMonths

        if (isSingleParent) {
            if (parent1BasisMonths > 14) {
                errors.push(
                    "As a single parent, you can take a maximum of 14 Basis months."
                )
            }
            if (parent1BasisMonths < 2 && parent1BasisMonths > 0) {
                errors.push("You must take at least 2 Basis months.")
            }
        } else {
            if (totalBasisMonths > 14) {
                errors.push(
                    `Maximum 14 Basis months total possible. You have selected ${totalBasisMonths}.`
                )
            }
            if (
                totalBasisMonths === 14 &&
                (parent1BasisMonths < 2 || parent2BasisMonths < 2)
            ) {
                errors.push(
                    "For 14 months, both parents must take at least 2 months each."
                )
            }
            let simultaneousCount = 0
            let simultaneousAfterMonth12 = false
            for (let i = 0; i < visibleMonths; i++) {
                const plan = monthPlans[i]
                if (
                    plan.parent1Type === "basis" &&
                    plan.parent2Type === "basis"
                ) {
                    simultaneousCount++
                    if (i >= 12) simultaneousAfterMonth12 = true
                }
            }
            if (simultaneousCount > 1) {
                errors.push(
                    "You can take a maximum of 1 month of simultaneous Basiselterngeld."
                )
            }
            if (simultaneousAfterMonth12) {
                errors.push(
                    "Simultaneous Basiselterngeld is only possible in the first 12 months of life."
                )
            }
        }
        return errors
    }

    const validationErrors = validateMonths()
    const hasValidationErrors = validationErrors.length > 0
    const canAddMoreMonths = visibleMonths < 36

    const renderStepper = () => {
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 900,
                            color: currentStep === 1 ? "#ffffff" : "#1a1a1a",
                            backgroundColor:
                                currentStep === 1 ? "#1a1a1a" : "#ffffff",
                            border: "1px solid #e1e1e1",
                        }}
                    >
                        1
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: "#1a1a1a",
                        }}
                    >
                        Calculator
                    </div>
                </div>
                <div style={{ width: 40, height: 1, background: "#e1e1e1" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                        style={{
                            width: 24,
                            height: 24,
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 900,
                            color: currentStep === 2 ? "#ffffff" : "#1a1a1a",
                            backgroundColor:
                                currentStep === 2 ? "#1a1a1a" : "#ffffff",
                            border: "1px solid #e1e1e1",
                        }}
                    >
                        2
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: "#1a1a1a",
                        }}
                    >
                        Planner
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                backgroundColor: "transparent",
            }}
        >
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e1e1e1",
                    borderRadius: 20,
                    padding: 30,
                    boxSizing: "border-box",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: 25,
                        minHeight: 25,
                        paddingBottom: 25,
                        marginBottom: 0,
                    }}
                >
                    {renderStepper()}
                    {currentStep === 1 ? (
                        <button
                            onClick={() => setCurrentStep(2)}
                            style={{
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 10,
                                border: "none",
                                background: "#1a1a1a",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 900,
                                color: "#ffffff",
                                flexShrink: 0,
                            }}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentStep(1)}
                            style={{
                                height: 36,
                                padding: "0 14px",
                                borderRadius: 10,
                                border: "1px solid #e1e1e1",
                                background: "#ffffff",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 900,
                                color: "#1a1a1a",
                                flexShrink: 0,
                            }}
                        >
                            Back
                        </button>
                    )}
                </div>

                <div
                    style={{
                        height: 1,
                        background: "#e5e7eb",
                        marginLeft: -30,
                        marginRight: -30,
                        marginBottom: 18,
                    }}
                />

                {currentStep === 1 && (
                    <div
                        style={{
                            width: "100%",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            paddingBottom: 50,
                        }}
                    >
                        <h1
                            style={{
                                fontSize: 22,
                                fontWeight: 900,
                                color: "#1a1a1a",
                                margin: "0 0 20px 0",
                                lineHeight: 1.2,
                            }}
                        >
                            Calculate your Elterngeld
                        </h1>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 16,
                                flex: 1,
                            }}
                        >
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "70% 30%",
                                    gap: 18,
                                    alignItems: "start",
                                }}
                            >
                                <div
                                    style={{
                                        padding: 28,
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 14,
                                        background: "#fafafa",
                                        display: "flex",
                                        flexDirection: "column",
                                        height: 450,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#111827",
                                            marginBottom: 2,
                                        }}
                                    >
                                        Your net income
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 400,
                                            color: "#374151",
                                            marginBottom: 50,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Select your average{" "}
                                        <button
                                            onClick={() =>
                                                triggerVoiceflowChat(
                                                    "explain how income is measured"
                                                )
                                            }
                                            style={{
                                                background: "none",
                                                border: "none",
                                                padding: 0,
                                                cursor: "pointer",
                                                color: "#111827",
                                                fontSize: 11,
                                                fontWeight: 800,
                                                textDecoration: "underline",
                                            }}
                                        >
                                            monthly net income
                                        </button>{" "}
                                        over the 12 months before birth (or the
                                        previous calendar year if self-employed)
                                    </div>

                                    <div
                                        style={{
                                            height: 80,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                        }}
                                    >
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
                                                marginTop: 15,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: "#9ca3af",
                                                    fontWeight: 800,
                                                }}
                                            >
                                                0 €
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: "#111827",
                                                    fontWeight: 900,
                                                }}
                                            >
                                                {income.toLocaleString("de-DE")}{" "}
                                                €
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 13,
                                                    color: "#9ca3af",
                                                    fontWeight: 800,
                                                }}
                                            >
                                                {SLIDER_MAX.toLocaleString(
                                                    "de-DE"
                                                )}{" "}
                                                €
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "grid",
                                            gap: 12,
                                            marginTop: 20,
                                            minHeight: 120,
                                        }}
                                    >
                                        <div>
                                            <Checkbox
                                                checked={siblingBonus}
                                                onChange={setSiblingBonus}
                                                label="Include sibling bonus"
                                            />
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#6b7280",
                                                    lineHeight: 1.4,
                                                    marginTop: 4,
                                                    marginLeft: 28,
                                                }}
                                            >
                                                If you have 1 child under 3 years
                                                old, or 2 children under 6 years
                                                old, or 1 child with a disability
                                                under 14 years old
                                            </div>
                                        </div>

                                        <div>
                                            <Checkbox
                                                checked={multipleChildren}
                                                onChange={setMultipleChildren}
                                                label="Include bonus for multiple births"
                                            />
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#6b7280",
                                                    lineHeight: 1.4,
                                                    marginTop: 4,
                                                    marginLeft: 28,
                                                }}
                                            >
                                                If you expect multiple children
                                                (e.g., twins or triplets)
                                            </div>
                                        </div>

                                        {multipleChildren && (
                                            <div style={{ marginLeft: 26 }}>
                                                <select
                                                    value={numberOfChildren}
                                                    onChange={(e) =>
                                                        setNumberOfChildren(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    style={{
                                                        padding: "8px 10px",
                                                        fontSize: 13,
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: 10,
                                                        backgroundColor:
                                                            "#ffffff",
                                                        cursor: "pointer",
                                                        width: 180,
                                                    }}
                                                >
                                                    {[
                                                        1, 2, 3, 4, 5, 6, 7, 8,
                                                        9, 10,
                                                    ].map((num) => (
                                                        <option
                                                            key={num}
                                                            value={num}
                                                        >
                                                            {num}{" "}
                                                            {num === 1
                                                                ? "child"
                                                                : "children"}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>

                                    {income > 2800 && (
                                        <div
                                            style={{
                                                marginTop: 12,
                                                fontSize: 12,
                                                lineHeight: 1.5,
                                                color: "#1e40af",
                                                display: "flex",
                                                gap: 8,
                                            }}
                                        >
                                            <span>ℹ️</span>
                                            <span>
                                                Income above ~€2,770 net/month
                                                results in the maximum
                                                Elterngeld of €1,800. If your
                                                annual income exceeds €175,000,
                                                you are not eligible for
                                                Elterngeld.
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 14,
                                        padding: 24,
                                        background: "#ffffff",
                                        height: 450,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <div style={{ paddingBottom: 20 }}>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "#374151",
                                                marginBottom: 10,
                                            }}
                                        >
                                            Basiselterngeld
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 24,
                                                    fontWeight: 900,
                                                    color: "#111827",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {result.isOverLimit
                                                    ? "0 €"
                                                    : `${result.basis.toLocaleString("de-DE")} €`}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#6b7280",
                                                    marginTop: 4,
                                                }}
                                            >
                                                for 12–14 months
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            borderTop: "1px solid #e5e7eb",
                                            marginBottom: 20,
                                        }}
                                    />

                                    <div style={{ paddingBottom: 20 }}>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                color: "#374151",
                                                marginBottom: 10,
                                            }}
                                        >
                                            ElterngeldPlus
                                        </div>
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 24,
                                                    fontWeight: 800,
                                                    color: "#111827",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {result.isOverLimit
                                                    ? "0 €"
                                                    : `${result.plus.toLocaleString("de-DE")} €`}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#6b7280",
                                                    marginTop: 4,
                                                }}
                                            >
                                                for 24–28 months
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            borderTop: "1px solid #e5e7eb",
                                            marginBottom: 16,
                                        }}
                                    />

                                    <Button
                                        onClick={() => setCurrentStep(2)}
                                        variant="outline"
                                        style={{
                                            width: "100%",
                                            marginTop: "auto",
                                        }}
                                    >
                                        Plan next
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Legal text positioned absolutely at bottom */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 4,
                                left: 30,
                                right: 30,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    lineHeight: 1.5,
                                    color: "#6b7280",
                                    textAlign: "center",
                                }}
                            >
                                This is <strong>not a final amount</strong>. It
                                is a <strong>quick estimate</strong> based on
                                the information provided.
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div
                        style={{
                            width: "100%",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            paddingBottom: 40,
                        }}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <h3
                                style={{
                                    fontSize: 22,
                                    fontWeight: 900,
                                    color: "#1a1a1a",
                                    margin: "0 0 6px 0",
                                }}
                            >
                                Plan your months
                            </h3>
                            <div
                                style={{
                                    fontSize: 11,
                                    color: "#6b7280",
                                    lineHeight: 1.4,
                                    marginBottom: 16,
                                }}
                            >
                                More details{" "}
                                <button
                                    onClick={() =>
                                        triggerVoiceflowChat(
                                            "explain elterngeld plus and basis"
                                        )
                                    }
                                    style={{
                                        background: "none",
                                        border: "none",
                                        padding: 0,
                                        cursor: "pointer",
                                        color: "#111827",
                                        fontSize: 11,
                                        fontWeight: 800,
                                        textDecoration: "underline",
                                    }}
                                >
                                    which options
                                </button>{" "}
                                you have
                            </div>

                            {/* Calendar and checkbox inputs */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                {/* Calendar input */}
                                <div
                                    ref={calendarRef}
                                    style={{
                                        position: "relative",
                                        minWidth: 180,
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            setIsCalendarOpen(!isCalendarOpen)
                                        }
                                        style={{
                                            width: "100%",
                                            height: 40,
                                            padding: "0 12px",
                                            borderRadius: 10,
                                            border: "1px solid #e1e1e1",
                                            background: "#ffffff",
                                            fontSize: 13,
                                            color: "#1a1a1a",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontWeight: childBirthDate ? 400 : 600,
                                        }}
                                    >
                                        {childBirthDate
                                            ? formatDate(childBirthDate, "PPP")
                                            : "Child's Birthday"}
                                    </button>
                                    {isCalendarOpen && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: "calc(100% + 4px)",
                                                left: 0,
                                                zIndex: 1000,
                                                background: "#ffffff",
                                                border: "1px solid #e1e1e1",
                                                borderRadius: 10,
                                                boxShadow:
                                                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                                padding: 12,
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

                                {/* Single parent checkbox */}
                                <div
                                    style={{
                                        height: 40,
                                        padding: "0 12px",
                                        borderRadius: 10,
                                        border: "1px solid #e1e1e1",
                                        background: "#ffffff",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Checkbox
                                        checked={isSingleParent}
                                        onChange={setIsSingleParent}
                                        label="I am a single parent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div
                            ref={scrollContainerRef}
                            style={{
                                width: "100%",
                                overflowX: "auto",
                                overflowY: "hidden",
                                WebkitOverflowScrolling: "touch",
                                paddingBottom: 16,
                                position: "relative",
                                maxHeight: "280px",
                            }}
                        >
                            <div
                                style={{
                                    display: "inline-flex",
                                    gap: 12,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {monthPlans
                                    .slice(0, visibleMonths)
                                    .map((plan, index) => {
                                        const amount = computeMonthTotal(plan)
                                        const dateRange =
                                            getMonthDateRange(index)
                                        const p1BasisChecked =
                                            plan.parent1Type === "basis"
                                        const p1PlusChecked =
                                            plan.parent1Type === "plus"
                                        const p2BasisChecked =
                                            plan.parent2Type === "basis"
                                        const p2PlusChecked =
                                            plan.parent2Type === "plus"
                                        const isSimultaneousBasis =
                                            !isSingleParent &&
                                            p1BasisChecked &&
                                            p2BasisChecked
                                        const hasError =
                                            hasValidationErrors &&
                                            isSimultaneousBasis

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    width: 100,
                                                    flex: "0 0 auto",
                                                    border: hasError
                                                        ? "2px solid #ef4444"
                                                        : "1px solid #e5e7eb",
                                                    borderRadius: 14,
                                                    padding: 16,
                                                    background: hasError
                                                        ? "#fff5f5"
                                                        : "#fafafa",
                                                    boxSizing: "border-box",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    justifyContent:
                                                        "space-between",
                                                    minHeight: 240,
                                                }}
                                            >
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: 900,
                                                            color: "#1a1a1a",
                                                            marginBottom: 8,
                                                        }}
                                                    >
                                                        Month {index + 1}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#9a9a9a",
                                                            marginBottom: 16,
                                                        }}
                                                    >
                                                        {dateRange ||
                                                            "dd/mm/yyyy"}
                                                    </div>
                                                    <div
                                                        style={{
                                                            borderTop:
                                                                "1px solid #e5e7eb",
                                                        }}
                                                    />
                                                </div>

                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gap: 6,
                                                    }}
                                                >
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontSize: 10,
                                                                color: "#9a9a9a",
                                                                marginBottom: 4,
                                                            }}
                                                        >
                                                            You
                                                        </div>
                                                        <div
                                                            style={{
                                                                display: "grid",
                                                                gap: 8,
                                                            }}
                                                        >
                                                            <label
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 6,
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        p1BasisChecked
                                                                    }
                                                                    onChange={() =>
                                                                        toggleCheckbox(
                                                                            index,
                                                                            1,
                                                                            "basis"
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: 14,
                                                                        height: 14,
                                                                        accentColor:
                                                                            "#1a1a1a",
                                                                    }}
                                                                />
                                                                <span
                                                                    style={{
                                                                        fontSize: 11,
                                                                        fontWeight: 800,
                                                                        color: "#1a1a1a",
                                                                    }}
                                                                >
                                                                    Basis
                                                                </span>
                                                            </label>
                                                            <label
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: 6,
                                                                    cursor: "pointer",
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        p1PlusChecked
                                                                    }
                                                                    onChange={() =>
                                                                        toggleCheckbox(
                                                                            index,
                                                                            1,
                                                                            "plus"
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: 14,
                                                                        height: 14,
                                                                        accentColor:
                                                                            "#1a1a1a",
                                                                    }}
                                                                />
                                                                <span
                                                                    style={{
                                                                        fontSize: 11,
                                                                        fontWeight: 800,
                                                                        color: "#1a1a1a",
                                                                    }}
                                                                >
                                                                    Plus
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {!isSingleParent && (
                                                        <div
                                                            style={{
                                                                paddingTop: 18,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    fontSize: 10,
                                                                    color: "#9a9a9a",
                                                                    marginBottom: 4,
                                                                }}
                                                            >
                                                                Partner
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "grid",
                                                                    gap: 8,
                                                                }}
                                                            >
                                                                <label
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 6,
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            p2BasisChecked
                                                                        }
                                                                        onChange={() =>
                                                                            toggleCheckbox(
                                                                                index,
                                                                                2,
                                                                                "basis"
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: 14,
                                                                            height: 14,
                                                                            accentColor:
                                                                                "#1a1a1a",
                                                                        }}
                                                                    />
                                                                    <span
                                                                        style={{
                                                                            fontSize: 11,
                                                                            fontWeight: 800,
                                                                            color: "#1a1a1a",
                                                                        }}
                                                                    >
                                                                        Basis
                                                                    </span>
                                                                </label>
                                                                <label
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: 6,
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={
                                                                            p2PlusChecked
                                                                        }
                                                                        onChange={() =>
                                                                            toggleCheckbox(
                                                                                index,
                                                                                2,
                                                                                "plus"
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: 14,
                                                                            height: 14,
                                                                            accentColor:
                                                                                "#1a1a1a",
                                                                        }}
                                                                    />
                                                                    <span
                                                                        style={{
                                                                            fontSize: 11,
                                                                            fontWeight: 800,
                                                                            color: "#1a1a1a",
                                                                        }}
                                                                    >
                                                                        Plus
                                                                    </span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        paddingTop: 8,
                                                        borderTop:
                                                            "1px solid #f0f0f0",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#9a9a9a",
                                                            marginBottom: 2,
                                                        }}
                                                    >
                                                        Amount
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 900,
                                                            color: amount
                                                                ? "#1a1a1a"
                                                                : "#c7c7c7",
                                                        }}
                                                    >
                                                        {amount
                                                            ? `${amount.toLocaleString("de-DE")} €`
                                                            : "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                {canAddMoreMonths && (
                                    <div
                                        onClick={() =>
                                            setVisibleMonths((m) =>
                                                Math.min(36, m + 1)
                                            )
                                        }
                                        style={{
                                            width: 100,
                                            flex: "0 0 auto",
                                            border: "2px dashed #e1e1e1",
                                            borderRadius: 14,
                                            padding: 16,
                                            background: "#fafafa",
                                            boxSizing: "border-box",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            cursor: "pointer",
                                            minHeight: 240,
                                            transition: "all 0.2s",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "50%",
                                                background: "#ffffff",
                                                border: "2px solid #1a1a1a",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                                fontWeight: 900,
                                                color: "#1a1a1a",
                                                marginBottom: 6,
                                                lineHeight: 1,
                                            }}
                                        >
                                            +
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 11,
                                                fontWeight: 800,
                                                color: "#1a1a1a",
                                                textAlign: "center",
                                            }}
                                        >
                                            Add month
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: 8, minHeight: 30 }}>
                            {hasValidationErrors && (
                                <div>
                                    {validationErrors.map((error, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                color: "#dc2626",
                                                fontSize: 12,
                                                lineHeight: 1.5,
                                                marginBottom:
                                                    idx <
                                                    validationErrors.length - 1
                                                        ? 6
                                                        : 0,
                                            }}
                                        >
                                            <span>⚠️</span>
                                            <span>{error}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Bottom section with button */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: 8,
                            }}
                        >
                            <Button variant="outline">
                                Start application now
                            </Button>
                        </div>

                        {/* Legal text positioned absolutely at bottom */}
                        <div
                            style={{
                                position: "absolute",
                                bottom: 4,
                                left: 30,
                                right: 30,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    lineHeight: 1.5,
                                    color: "#6b7280",
                                    textAlign: "center",
                                }}
                            >
                                This is <strong>not a final amount</strong>. It
                                is a <strong>quick estimate</strong> based on
                                the information provided.
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                    input[type="range"]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #111827;
                        cursor: pointer;
                        border: 3px solid #ffffff;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                    }
                    input[type="range"]::-moz-range-thumb {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: #111827;
                        cursor: pointer;
                        border: 3px solid #ffffff;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
                    }
                    input[type="date"]::-webkit-calendar-picker-indicator {
                        cursor: pointer;
                    }
                `}</style>
            </div>
        </div>
    )
}

// ============================================
// VOICEFLOW CHAT COMPONENT
// ============================================

function VoiceflowChat() {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadChat = () => {
            const vf = (window as any).voiceflow
            if (!vf?.chat?.load || !containerRef.current) return

            vf.chat
                .load({
                    verify: { projectID: "69173e22a302c7cedb983faf" },
                    url: "https://general-runtime.voiceflow.com",
                    versionID: "production",
                    voice: { url: "https://runtime-api.voiceflow.com" },
                    render: { mode: "embedded", target: containerRef.current },
                    assistant: {
                        stylesheet:
                            "https://easyjolabs.github.io/voiceflow-styles/voiceflow.css",
                    },
                })
                .then(() => {
                    setIsLoading(false)
                    ;(window as any).sendToVoiceflow = (message: string) => {
                        const vf = (window as any).voiceflow
                        if (vf?.chat?.interact) {
                            vf.chat.interact({ type: "text", payload: message })
                        }
                    }
                    const sessionMessage =
                        sessionStorage.getItem("vf_initial_message")
                    if (sessionMessage) {
                        sessionStorage.removeItem("vf_initial_message")
                        setTimeout(() => {
                            ;(window as any).voiceflow?.chat?.interact({
                                type: "text",
                                payload: sessionMessage,
                            })
                        }, 800)
                    }
                })
                .catch(() => setIsLoading(false))
        }

        const existingScript = document.querySelector(
            'script[data-vf-widget="true"]'
        ) as HTMLScriptElement
        if (existingScript?.dataset.loaded === "true") {
            loadChat()
            return
        }
        if (existingScript) {
            existingScript.addEventListener("load", loadChat)
            return () => existingScript.removeEventListener("load", loadChat)
        }

        const script = document.createElement("script")
        script.src = "https://cdn.voiceflow.com/widget-next/bundle.mjs"
        script.async = true
        script.setAttribute("data-vf-widget", "true")
        script.onload = () => {
            script.dataset.loaded = "true"
            loadChat()
        }
        document.body.appendChild(script)

        return () => {
            delete (window as any).sendToVoiceflow
        }
    }, [])

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#ffffff",
                border: "1px solid #e1e1e1",
                borderRadius: 20,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
            }}
        >
            {isLoading && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        zIndex: 10,
                    }}
                >
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "3px solid #F5F5F5",
                            borderTopColor: "#FB6A42",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            margin: "0 auto 12px",
                        }}
                    />
                    <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                        Loading chat...
                    </div>
                </div>
            )}
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    opacity: isLoading ? 0 : 1,
                    transition: "opacity 0.3s",
                }}
            />
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

// ============================================
// RESIZABLE SPLIT VIEW - MAIN EXPORT
// ============================================

const NAV_HEIGHT = 70

export default function ResizableSplitView(props: {
    defaultLeftWidth?: number
    minLeftWidth?: number
    minRightWidth?: number
    dividerColor?: string
    dividerHoverColor?: string
    backgroundColor?: string
}) {
    const {
        defaultLeftWidth = 65,
        minLeftWidth = 520,
        minRightWidth = 320,
        dividerColor = "#e5e7eb",
        dividerHoverColor = "#9ca3af",
        backgroundColor = "#f5f5f5",
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const [leftWidthPercent, setLeftWidthPercent] = useState(defaultLeftWidth)
    const [isDragging, setIsDragging] = useState(false)
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        e.stopPropagation()
        setIsDragging(true)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const mouseX = e.clientX - rect.left
            let percent = (mouseX / rect.width) * 100
            const minLeft = (minLeftWidth / rect.width) * 100
            const maxLeft = 100 - (minRightWidth / rect.width) * 100
            percent = Math.max(minLeft, Math.min(maxLeft, percent))
            setLeftWidthPercent(percent)
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging || !containerRef.current) return
            const touch = e.touches[0]
            const rect = containerRef.current.getBoundingClientRect()
            const touchX = touch.clientX - rect.left
            let percent = (touchX / rect.width) * 100
            const minLeft = (minLeftWidth / rect.width) * 100
            const maxLeft = 100 - (minRightWidth / rect.width) * 100
            percent = Math.max(minLeft, Math.min(maxLeft, percent))
            setLeftWidthPercent(percent)
        }

        const handleEnd = () => setIsDragging(false)

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("mouseup", handleEnd)
            window.addEventListener("touchmove", handleTouchMove)
            window.addEventListener("touchend", handleEnd)
            document.body.style.cursor = "col-resize"
            document.body.style.userSelect = "none"
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleEnd)
            window.removeEventListener("touchmove", handleTouchMove)
            window.removeEventListener("touchend", handleEnd)
            document.body.style.cursor = ""
            document.body.style.userSelect = ""
        }
    }, [isDragging, minLeftWidth, minRightWidth])

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: `calc(100vh - ${NAV_HEIGHT}px)`,
                marginTop: NAV_HEIGHT,
                display: "flex",
                flexDirection: "row",
                backgroundColor,
                overflow: "hidden",
                position: "relative",
                padding: 16,
                boxSizing: "border-box",
                gap: 8,
            }}
        >
            {/* Left Panel - Calculator */}
            <div
                style={{
                    width: `calc(${leftWidthPercent}% - 6px)`,
                    height: "100%",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <ElterngeldCalculator />
            </div>

            {/* Divider */}
            <div
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => !isDragging && setIsHovering(false)}
                style={{
                    width: 16,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "col-resize",
                    flexShrink: 0,
                    backgroundColor: "transparent",
                    zIndex: 100,
                    touchAction: "none",
                }}
            >
                <div
                    style={{
                        width: 4,
                        height: "80px",
                        backgroundColor:
                            isDragging || isHovering
                                ? dividerHoverColor
                                : dividerColor,
                        transition: isDragging
                            ? "none"
                            : "background-color 0.15s ease",
                        pointerEvents: "none",
                        borderRadius: 4,
                    }}
                />
            </div>

            {/* Right Panel - Chat */}
            <div
                style={{
                    width: `calc(${100 - leftWidthPercent}% - 6px)`,
                    height: "100%",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                <VoiceflowChat />
            </div>

            {/* Overlay during drag */}
            {isDragging && (
                <div
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 99,
                        cursor: "col-resize",
                    }}
                />
            )}
        </div>
    )
}

addPropertyControls(ResizableSplitView, {
    defaultLeftWidth: {
        type: ControlType.Number,
        title: "Left Width %",
        defaultValue: 65,
        min: 20,
        max: 80,
        step: 1,
    },
    minLeftWidth: {
        type: ControlType.Number,
        title: "Min Left",
        defaultValue: 520,
        min: 100,
        max: 600,
        step: 10,
    },
    minRightWidth: {
        type: ControlType.Number,
        title: "Min Right",
        defaultValue: 320,
        min: 100,
        max: 600,
        step: 10,
    },
    dividerColor: {
        type: ControlType.Color,
        title: "Divider",
        defaultValue: "#e5e7eb",
    },
    dividerHoverColor: {
        type: ControlType.Color,
        title: "Divider Hover",
        defaultValue: "#9ca3af",
    },
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#f5f5f5",
    },
})
