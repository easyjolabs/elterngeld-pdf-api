import { useState, useRef, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

// ============================================
// TYPES
// ============================================

declare global {
    interface Window {
        voiceflow?: {
            chat?: {
                load?: (config: {
                    verify: { projectID: string }
                    url: string
                    versionID: string
                    render: { mode: string }
                }) => void
            }
        }
    }
}

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
                                    ? "#1a1a1a"
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
            background: "#1a1a1a",
            color: "#ffffff",
        },
        outline: {
            background: "#ffffff",
            color: "#1a1a1a",
            border: "1.5px solid #1a1a1a",
        },
        ghost: {
            background: "transparent",
            color: "#111827",
        },
    }

    const [isHovered, setIsHovered] = useState(false)

    const hoverStyles: Record<string, React.CSSProperties> = {
        default: { background: "#374151" },
        outline: { background: "#f9fafb" },
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
                    border: `2px solid ${checked ? "#1a1a1a" : "#d1d5db"}`,
                    background: checked ? "#1a1a1a" : "#ffffff",
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
                    background: `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
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
                    background: #1a1a1a;
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #1a1a1a;
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
    const [leftWidth, setLeftWidth] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const calendarRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
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

    // Resize handler
    const handleMouseDown = () => {
        setIsDragging(true)
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return
            const container = containerRef.current
            const containerRect = container.getBoundingClientRect()
            const newLeftWidth =
                ((e.clientX - containerRect.left) / containerRect.width) * 100
            if (newLeftWidth >= 30 && newLeftWidth <= 70) {
                setLeftWidth(newLeftWidth)
            }
        }

        const handleMouseUp = () => {
            setIsDragging(false)
        }

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging])

    // Load Voiceflow chat widget
    useEffect(() => {
        const script = document.createElement('script')
        script.type = 'text/javascript'
        script.src = 'https://cdn.voiceflow.com/widget/bundle.mjs'

        script.onload = () => {
            if (window.voiceflow?.chat?.load) {
                window.voiceflow.chat.load({
                    verify: { projectID: '675be3ba5c45e9e8e96c9d40' },
                    url: 'https://general-runtime.voiceflow.com',
                    versionID: 'production',
                })
            }
        }

        document.head.appendChild(script)

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script)
            }
        }
    }, [])

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

    // Scroll to next month box
    const scrollToNext = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({
                left: 152, // 140px width + 12px gap
                behavior: "smooth",
            })
        }
    }

    // Check if there are more months to scroll to
    const hasMoreMonths = () => {
        if (!scrollContainerRef.current) return false
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        return scrollLeft + clientWidth < scrollWidth - 10
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "calc(100vh - 90px)", // Account for 90px navigation
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                backgroundColor: "transparent",
                display: "flex",
                gap: 0,
                overflow: "hidden",
            }}
        >
            {/* Left Panel - Calculator */}
            <div
                style={{
                    width: `${leftWidth}%`,
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
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: currentStep === 1 ? "#1a1a1a" : "#e5e7eb",
                                color: currentStep === 1 ? "#ffffff" : "#9ca3af",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                            }}
                        >
                            1
                        </div>
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "50%",
                                background: currentStep === 2 ? "#1a1a1a" : "#e5e7eb",
                                color: currentStep === 2 ? "#ffffff" : "#9ca3af",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 13,
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                            }}
                        >
                            2
                        </div>
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
                        {currentStep === 1 ? "Calculator" : "Planner"}
                    </h2>
                    <div style={{ width: 68 }} />
                </div>

                {/* Content Area */}
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
                            {/* Headline */}
                            <h1
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: "#111827",
                                    margin: 0,
                                }}
                            >
                                Calculate Elterngeld
                            </h1>

                            {/* Income Section with Result Box */}
                            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
                                {/* Left: Income Slider in Box */}
                                <div
                                    style={{
                                        flex: 1,
                                        padding: 24,
                                        background: "#f9fafb",
                                        borderRadius: 12,
                                        border: "1px solid #e5e7eb",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 16,
                                    }}
                                >
                                    <div>
                                        <h3
                                            style={{
                                                fontSize: 15,
                                                fontWeight: 600,
                                                color: "#111827",
                                                margin: "0 0 4px 0",
                                            }}
                                        >
                                            Your net income
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: 13,
                                                color: "#6b7280",
                                                margin: 0,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            Your average{" "}
                                            <button
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#6b7280",
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                    padding: 0,
                                                    fontSize: 13,
                                                }}
                                            >
                                                monthly net income
                                            </button>{" "}
                                            over the 12 months before birth (or the previous calendar year
                                            if self-employed)
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

                                {/* Right: Result Box */}
                                <div
                                    style={{
                                        width: 280,
                                        flexShrink: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 12,
                                    }}
                                >
                                    <div
                                        style={{
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
                                    <p
                                        style={{
                                            fontSize: 12,
                                            color: "#6b7280",
                                            margin: 0,
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        Your monthly Elterngeld amount. Basiselterngeld is paid for up to 12 months, ElterngeldPlus for up to 24 months.
                                    </p>
                                </div>
                            </div>

                            {/* Bonuses Section */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <Checkbox
                                    checked={siblingBonus}
                                    onChange={setSiblingBonus}
                                    label="Include sibling bonus"
                                />
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#6b7280",
                                        margin: "-8px 0 0 30px",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    If you have 1 child under 3 years old, or 2 children under 6
                                    years old, or 1 child with a disability under 14 years old
                                </p>

                                <Checkbox
                                    checked={multipleChildren}
                                    onChange={setMultipleChildren}
                                    label="Include bonus for multiple births"
                                />
                                <p
                                    style={{
                                        fontSize: 12,
                                        color: "#6b7280",
                                        margin: "-8px 0 0 30px",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    If you expect multiple children (e.g., twins or triplets)
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
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                <option key={num} value={num}>
                                                    {num} {num === 1 ? "child" : "children"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {income > 2800 && (
                                <div
                                    style={{
                                        padding: 12,
                                        background: "#eff6ff",
                                        border: "1px solid #bfdbfe",
                                        borderRadius: 8,
                                        fontSize: 12,
                                        color: "#1e40af",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    The maximum base parental allowance is €1,800, which you reach
                                    with a net income of around €2,770. Any income above that
                                    doesn't increase your base parental allowance, but may still
                                    affect ElterngeldPlus.
                                </div>
                            )}

                            {/* Bottom Action */}
                            <Button onClick={() => setCurrentStep(2)} style={{ width: "100%" }}>
                                Plan next
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
                                overflowY: "auto",
                            }}
                        >
                            {/* Headline */}
                            <h1
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    color: "#111827",
                                    margin: 0,
                                }}
                            >
                                Plan Elterngeld
                            </h1>

                            {/* Child Info */}
                            <div>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: "#6b7280",
                                        margin: "0 0 12px 0",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    Learn about{" "}
                                    <button
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#6b7280",
                                            textDecoration: "underline",
                                            cursor: "pointer",
                                            padding: 0,
                                            fontSize: 13,
                                        }}
                                    >
                                        which options
                                    </button>{" "}
                                    you have
                                </p>

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
                                            label="I am a single parent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Month Planner */}
                            <div
                                style={{
                                    flex: 1,
                                    minHeight: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 16,
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        flex: 1,
                                        minHeight: 0,
                                    }}
                                >
                                    <div
                                        ref={scrollContainerRef}
                                        style={{
                                            overflowX: "auto",
                                            overflowY: "auto",
                                            height: "100%",
                                        }}
                                        onScroll={() => {
                                            // Force re-render to update scroll indicator
                                            if (scrollContainerRef.current) {
                                                scrollContainerRef.current.style.opacity = "0.999"
                                                setTimeout(() => {
                                                    if (scrollContainerRef.current) {
                                                        scrollContainerRef.current.style.opacity = "1"
                                                    }
                                                }, 0)
                                            }
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
                                                                    color: "#1a1a1a",
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

                                    {/* Scroll Indicator */}
                                    {hasMoreMonths() && (
                                        <button
                                            onClick={scrollToNext}
                                            style={{
                                                position: "absolute",
                                                right: 0,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                background: "#1a1a1a",
                                                color: "#ffffff",
                                                border: "none",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 18,
                                                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                                zIndex: 10,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = "#374151"
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = "#1a1a1a"
                                            }}
                                        >
                                            →
                                        </button>
                                    )}
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
                                        Both parents cannot receive Basiselterngeld in the same month.
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
                                <Button style={{ flex: 1 }}>Start application now</Button>
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
                    This is <strong>not a final amount</strong>. It is a{" "}
                    <strong>quick estimate</strong> based on the information provided.
                </div>
            </div>

            {/* Resize Handle */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    width: 8,
                    height: "100%",
                    cursor: "col-resize",
                    background: isDragging ? "#d1d5db" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: isDragging ? "none" : "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                    if (!isDragging) {
                        e.currentTarget.style.background = "#e5e7eb"
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isDragging) {
                        e.currentTarget.style.background = "transparent"
                    }
                }}
            >
                <div
                    style={{
                        width: 3,
                        height: 40,
                        background: "#9ca3af",
                        borderRadius: 2,
                    }}
                />
            </div>

            {/* Right Panel - Chat */}
            <div
                id="voiceflow-chat-container"
                style={{
                    width: `${100 - leftWidth}%`,
                    height: "100%",
                    backgroundColor: "#ffffff",
                    borderRadius: 16,
                    boxSizing: "border-box",
                    overflow: "auto",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                    position: "relative",
                    padding: 32,
                }}
            >
                <div
                    style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                        }}
                    >
                        💬
                    </div>
                    <h3
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#111827",
                            margin: 0,
                        }}
                    >
                        Chat Assistant
                    </h3>
                    <p
                        style={{
                            fontSize: 14,
                            color: "#6b7280",
                            margin: 0,
                            textAlign: "center",
                            maxWidth: 320,
                            lineHeight: 1.5,
                        }}
                    >
                        Our AI assistant is ready to help you with your Elterngeld questions. Click the chat button to get started.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function ElterngeldSplitView() {
    return <ElterngeldCalculator />
}

addPropertyControls(ElterngeldSplitView, {})
