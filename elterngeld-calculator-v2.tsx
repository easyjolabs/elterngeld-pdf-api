import { useState, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

// ============================================
// TYPES
// ============================================

type MonthPlan = {
    parent1Type: "basis" | "plus" | "none"
    parent2Type: "basis" | "plus" | "none"
}

type ValidationError = {
    message: string
    monthIndex?: number
}

// ============================================
// SHADCN-STYLE COMPONENTS
// ============================================

const Button = ({
    children,
    onClick,
    variant = "default",
    size = "default",
    className = "",
    disabled = false,
}: {
    children: React.ReactNode
    onClick?: () => void
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg"
    className?: string
    disabled?: boolean
}) => {
    const baseStyles: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        transition: "all 0.15s",
        cursor: disabled ? "not-allowed" : "pointer",
        border: "none",
        outline: "none",
        opacity: disabled ? 0.5 : 1,
    }

    const variants = {
        default: {
            background: "#18181b",
            color: "#fafafa",
            border: "1px solid #18181b",
        },
        outline: {
            background: "transparent",
            color: "#18181b",
            border: "1px solid #e4e4e7",
        },
        ghost: {
            background: "transparent",
            color: "#18181b",
            border: "1px solid transparent",
        },
    }

    const sizes = {
        default: { height: 40, padding: "0 16px" },
        sm: { height: 36, padding: "0 12px", fontSize: 13 },
        lg: { height: 44, padding: "0 20px" },
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
            className={className}
        >
            {children}
        </button>
    )
}

const Checkbox = ({
    checked,
    onCheckedChange,
    label,
    description,
}: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    label?: string
    description?: string
}) => {
    return (
        <label
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                cursor: "pointer",
            }}
        >
            <div
                onClick={() => onCheckedChange(!checked)}
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `2px solid ${checked ? "#18181b" : "#e4e4e7"}`,
                    background: checked ? "#18181b" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                }}
            >
                {checked && (
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
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
            {(label || description) && (
                <div style={{ flex: 1 }}>
                    {label && (
                        <div
                            style={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#18181b",
                                marginBottom: description ? 2 : 0,
                            }}
                        >
                            {label}
                        </div>
                    )}
                    {description && (
                        <div
                            style={{
                                fontSize: 13,
                                color: "#71717a",
                                lineHeight: 1.4,
                            }}
                        >
                            {description}
                        </div>
                    )}
                </div>
            )}
        </label>
    )
}

const Slider = ({
    value,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
}: {
    value: number
    onValueChange: (value: number) => void
    min?: number
    max?: number
    step?: number
}) => {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div style={{ width: "100%", paddingTop: 8, paddingBottom: 8 }}>
            <input
                type="range"
                value={value}
                onChange={(e) => onValueChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                style={{
                    width: "100%",
                    height: 6,
                    borderRadius: 999,
                    appearance: "none",
                    background: `linear-gradient(to right, #18181b 0%, #18181b ${percentage}%, #e4e4e7 ${percentage}%, #e4e4e7 100%)`,
                    outline: "none",
                    cursor: "pointer",
                }}
            />
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #18181b;
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #18181b;
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </div>
    )
}

const Card = ({
    children,
    className = "",
}: {
    children: React.ReactNode
    className?: string
}) => {
    return (
        <div
            className={className}
            style={{
                background: "#ffffff",
                border: "1px solid #e4e4e7",
                borderRadius: 8,
                padding: 20,
            }}
        >
            {children}
        </div>
    )
}

// ============================================
// MAIN CALCULATOR COMPONENT
// ============================================

function ElterngeldCalculatorV2() {
    const [currentStep, setCurrentStep] = useState<1 | 2>(1)
    const [income, setIncome] = useState(2000)
    const [siblingBonus, setSiblingBonus] = useState(false)
    const [multipleChildren, setMultipleChildren] = useState(false)
    const [numberOfChildren, setNumberOfChildren] = useState(1)
    const [childBirthDate, setChildBirthDate] = useState<string>("")
    const [isSingleParent, setIsSingleParent] = useState(false)
    const [monthPlans, setMonthPlans] = useState<MonthPlan[]>(
        Array.from({ length: 36 }, () => ({
            parent1Type: "none",
            parent2Type: "none",
        }))
    )
    const [visibleMonths, setVisibleMonths] = useState(14)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const SLIDER_MAX = 7000

    // Calculate allowance
    const calculateAllowance = () => {
        const annualIncome = income * 12
        if (annualIncome > 175000) {
            return { basis: 0, plus: 0, isOverLimit: true }
        }
        let basis = income * 0.65
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
        }
    }

    const result = calculateAllowance()

    // Toggle month checkbox
    const toggleCheckbox = (
        monthIndex: number,
        parent: 1 | 2,
        type: "basis" | "plus"
    ) => {
        setMonthPlans((prev) => {
            const next = [...prev]
            const current = next[monthIndex]
            const key = parent === 1 ? "parent1Type" : "parent2Type"
            next[monthIndex] = {
                ...current,
                [key]: current[key] === type ? "none" : type,
            }
            return next
        })
    }

    // Calculate month total
    const computeMonthTotal = (plan: MonthPlan) => {
        let total = 0
        if (plan.parent1Type === "basis") total += result.basis
        if (plan.parent1Type === "plus") total += result.plus
        if (plan.parent2Type === "basis") total += result.basis
        if (plan.parent2Type === "plus") total += result.plus
        return total
    }

    // Get month date range
    const getMonthDateRange = (monthIndex: number): string => {
        if (!childBirthDate) return "—"
        const birthDate = new Date(childBirthDate)
        const startDate = new Date(birthDate)
        startDate.setMonth(startDate.getMonth() + monthIndex)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1)
        const format = (d: Date) =>
            `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`
        return `${format(startDate)} - ${format(endDate)}`
    }

    // Validation
    const validateMonths = (): ValidationError[] => {
        const errors: ValidationError[] = []
        const parent1BasisMonths = monthPlans.filter(
            (m) => m.parent1Type === "basis"
        ).length
        const parent2BasisMonths = monthPlans.filter(
            (m) => m.parent2Type === "basis"
        ).length
        const totalBasisMonths = parent1BasisMonths + parent2BasisMonths

        if (isSingleParent) {
            if (parent1BasisMonths > 14) {
                errors.push({
                    message:
                        "As a single parent, you can take a maximum of 14 Basis months.",
                })
            }
            if (parent1BasisMonths > 0 && parent1BasisMonths < 2) {
                errors.push({
                    message: "You must take at least 2 Basis months.",
                })
            }
        } else {
            if (totalBasisMonths > 14) {
                errors.push({
                    message: `Maximum 14 Basis months total possible. You have selected ${totalBasisMonths}.`,
                })
            }
            if (
                totalBasisMonths === 14 &&
                (parent1BasisMonths < 2 || parent2BasisMonths < 2)
            ) {
                errors.push({
                    message:
                        "For 14 months, both parents must take at least 2 months each.",
                })
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
                errors.push({
                    message:
                        "You can take a maximum of 1 month of simultaneous Basiselterngeld.",
                })
            }
            if (simultaneousAfterMonth12) {
                errors.push({
                    message:
                        "Simultaneous Basiselterngeld is only possible in the first 12 months of life.",
                })
            }
        }
        return errors
    }

    const validationErrors = validateMonths()
    const hasValidationErrors = validationErrors.length > 0

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: 700,
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                backgroundColor: "#fafafa",
                padding: 24,
                boxSizing: "border-box",
                overflow: "auto",
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                }}
            >
                {/* Header with Steps */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: currentStep === 1 ? "#18181b" : "#e4e4e7",
                                color: currentStep === 1 ? "#ffffff" : "#71717a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            1
                        </div>
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: currentStep === 1 ? 600 : 400,
                                color: currentStep === 1 ? "#18181b" : "#71717a",
                            }}
                        >
                            Calculator
                        </span>
                        <div
                            style={{
                                width: 24,
                                height: 1,
                                background: "#e4e4e7",
                            }}
                        />
                        <div
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: "50%",
                                background: currentStep === 2 ? "#18181b" : "#e4e4e7",
                                color: currentStep === 2 ? "#ffffff" : "#71717a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            2
                        </div>
                        <span
                            style={{
                                fontSize: 14,
                                fontWeight: currentStep === 2 ? 600 : 400,
                                color: currentStep === 2 ? "#18181b" : "#71717a",
                            }}
                        >
                            Planner
                        </span>
                    </div>
                    {currentStep === 1 ? (
                        <Button onClick={() => setCurrentStep(2)}>Next</Button>
                    ) : (
                        <Button variant="outline" onClick={() => setCurrentStep(1)}>
                            Back
                        </Button>
                    )}
                </div>

                {/* Step 1: Calculator */}
                {currentStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: "#18181b",
                                margin: 0,
                            }}
                        >
                            Calculate your Elterngeld
                        </h1>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr",
                                gap: 20,
                                alignItems: "start",
                            }}
                        >
                            {/* Income Section */}
                            <Card>
                                <div style={{ marginBottom: 20 }}>
                                    <h3
                                        style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: "#18181b",
                                            margin: "0 0 4px 0",
                                        }}
                                    >
                                        Monthly net income
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: 13,
                                            color: "#71717a",
                                            margin: 0,
                                        }}
                                    >
                                        Average over the 12 months before birth
                                    </p>
                                </div>

                                <Slider
                                    value={income}
                                    onValueChange={setIncome}
                                    min={0}
                                    max={SLIDER_MAX}
                                    step={50}
                                />

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: 12,
                                        marginBottom: 24,
                                    }}
                                >
                                    <span style={{ fontSize: 13, color: "#a1a1aa" }}>
                                        €0
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 18,
                                            fontWeight: 700,
                                            color: "#18181b",
                                        }}
                                    >
                                        €{income.toLocaleString("de-DE")}
                                    </span>
                                    <span style={{ fontSize: 13, color: "#a1a1aa" }}>
                                        €{SLIDER_MAX.toLocaleString("de-DE")}
                                    </span>
                                </div>

                                {/* Bonuses */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <Checkbox
                                        checked={siblingBonus}
                                        onCheckedChange={setSiblingBonus}
                                        label="Include sibling bonus"
                                        description="If you have 1 child under 3, or 2 children under 6, or 1 disabled child under 14"
                                    />

                                    <Checkbox
                                        checked={multipleChildren}
                                        onCheckedChange={setMultipleChildren}
                                        label="Include bonus for multiple births"
                                        description="If you expect multiple children (e.g., twins or triplets)"
                                    />

                                    {multipleChildren && (
                                        <select
                                            value={numberOfChildren}
                                            onChange={(e) =>
                                                setNumberOfChildren(Number(e.target.value))
                                            }
                                            style={{
                                                marginLeft: 32,
                                                padding: "8px 12px",
                                                fontSize: 14,
                                                border: "1px solid #e4e4e7",
                                                borderRadius: 6,
                                                background: "#ffffff",
                                                cursor: "pointer",
                                                width: 180,
                                            }}
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                                <option key={num} value={num}>
                                                    {num} {num === 1 ? "child" : "children"}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {income > 2770 && (
                                    <div
                                        style={{
                                            marginTop: 16,
                                            padding: 12,
                                            background: "#eff6ff",
                                            border: "1px solid #bfdbfe",
                                            borderRadius: 6,
                                            fontSize: 13,
                                            color: "#1e40af",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        ℹ️ Maximum Elterngeld of €1,800 reached. Income above
                                        ~€2,770/month doesn't increase the amount.
                                    </div>
                                )}
                            </Card>

                            {/* Results */}
                            <Card>
                                <div style={{ marginBottom: 20 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "#71717a",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Basiselterngeld
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: "#18181b",
                                        }}
                                    >
                                        {result.isOverLimit
                                            ? "€0"
                                            : `€${result.basis.toLocaleString("de-DE")}`}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#71717a" }}>
                                        for 12–14 months
                                    </div>
                                </div>

                                <div
                                    style={{
                                        height: 1,
                                        background: "#e4e4e7",
                                        margin: "20px 0",
                                    }}
                                />

                                <div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "#71717a",
                                            marginBottom: 4,
                                        }}
                                    >
                                        ElterngeldPlus
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 32,
                                            fontWeight: 700,
                                            color: "#18181b",
                                        }}
                                    >
                                        {result.isOverLimit
                                            ? "€0"
                                            : `€${result.plus.toLocaleString("de-DE")}`}
                                    </div>
                                    <div style={{ fontSize: 13, color: "#71717a" }}>
                                        for 24–28 months
                                    </div>
                                </div>

                                {result.isOverLimit && (
                                    <div
                                        style={{
                                            marginTop: 16,
                                            padding: 12,
                                            background: "#fef2f2",
                                            border: "1px solid #fecaca",
                                            borderRadius: 6,
                                            fontSize: 13,
                                            color: "#dc2626",
                                        }}
                                    >
                                        Income exceeds €175,000 annual limit
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Disclaimer */}
                        <p
                            style={{
                                fontSize: 12,
                                color: "#71717a",
                                textAlign: "center",
                                margin: "20px 0 0 0",
                            }}
                        >
                            This is <strong>not a final amount</strong>. It is a{" "}
                            <strong>quick estimate</strong> based on the information provided.
                        </p>
                    </div>
                )}

                {/* Step 2: Planner */}
                {currentStep === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 700,
                                color: "#18181b",
                                margin: 0,
                            }}
                        >
                            Plan your months
                        </h1>

                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                            <input
                                type="date"
                                value={childBirthDate}
                                onChange={(e) => setChildBirthDate(e.target.value)}
                                style={{
                                    padding: "10px 12px",
                                    fontSize: 14,
                                    border: "1px solid #e4e4e7",
                                    borderRadius: 6,
                                    background: "#ffffff",
                                    cursor: "pointer",
                                }}
                            />
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "10px 12px",
                                    border: "1px solid #e4e4e7",
                                    borderRadius: 6,
                                    background: "#ffffff",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSingleParent}
                                    onChange={(e) => setIsSingleParent(e.target.checked)}
                                    style={{
                                        width: 16,
                                        height: 16,
                                        cursor: "pointer",
                                        accentColor: "#18181b",
                                    }}
                                />
                                <span style={{ fontSize: 14, fontWeight: 500 }}>
                                    I am a single parent
                                </span>
                            </label>
                        </div>

                        {/* Month boxes */}
                        <div
                            ref={scrollContainerRef}
                            style={{
                                overflowX: "auto",
                                overflowY: "hidden",
                                paddingBottom: 12,
                            }}
                        >
                            <div style={{ display: "flex", gap: 12, minWidth: "min-content" }}>
                                {monthPlans.slice(0, visibleMonths).map((plan, index) => {
                                    const amount = computeMonthTotal(plan)
                                    const dateRange = getMonthDateRange(index)
                                    const hasError =
                                        !isSingleParent &&
                                        plan.parent1Type === "basis" &&
                                        plan.parent2Type === "basis"

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                width: 120,
                                                flexShrink: 0,
                                                padding: 16,
                                                border: hasError
                                                    ? "2px solid #dc2626"
                                                    : "1px solid #e4e4e7",
                                                borderRadius: 8,
                                                background: hasError ? "#fef2f2" : "#ffffff",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 12,
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: 600,
                                                        color: "#18181b",
                                                    }}
                                                >
                                                    Month {index + 1}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#a1a1aa",
                                                    }}
                                                >
                                                    {dateRange}
                                                </div>
                                            </div>

                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#71717a",
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    You
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                    <label
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={plan.parent1Type === "basis"}
                                                            onChange={() =>
                                                                toggleCheckbox(index, 1, "basis")
                                                            }
                                                            style={{
                                                                width: 14,
                                                                height: 14,
                                                                cursor: "pointer",
                                                                accentColor: "#18181b",
                                                            }}
                                                        />
                                                        <span style={{ fontSize: 13 }}>Basis</span>
                                                    </label>
                                                    <label
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 6,
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={plan.parent1Type === "plus"}
                                                            onChange={() =>
                                                                toggleCheckbox(index, 1, "plus")
                                                            }
                                                            style={{
                                                                width: 14,
                                                                height: 14,
                                                                cursor: "pointer",
                                                                accentColor: "#18181b",
                                                            }}
                                                        />
                                                        <span style={{ fontSize: 13 }}>Plus</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {!isSingleParent && (
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: "#71717a",
                                                            marginBottom: 6,
                                                        }}
                                                    >
                                                        Partner
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                        <label
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6,
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={plan.parent2Type === "basis"}
                                                                onChange={() =>
                                                                    toggleCheckbox(index, 2, "basis")
                                                                }
                                                                style={{
                                                                    width: 14,
                                                                    height: 14,
                                                                    cursor: "pointer",
                                                                    accentColor: "#18181b",
                                                                }}
                                                            />
                                                            <span style={{ fontSize: 13 }}>Basis</span>
                                                        </label>
                                                        <label
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6,
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={plan.parent2Type === "plus"}
                                                                onChange={() =>
                                                                    toggleCheckbox(index, 2, "plus")
                                                                }
                                                                style={{
                                                                    width: 14,
                                                                    height: 14,
                                                                    cursor: "pointer",
                                                                    accentColor: "#18181b",
                                                                }}
                                                            />
                                                            <span style={{ fontSize: 13 }}>Plus</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    marginTop: "auto",
                                                    paddingTop: 12,
                                                    borderTop: "1px solid #e4e4e7",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#71717a",
                                                    }}
                                                >
                                                    Amount
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                        color: amount ? "#18181b" : "#d4d4d8",
                                                    }}
                                                >
                                                    {amount
                                                        ? `€${amount.toLocaleString("de-DE")}`
                                                        : "—"}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {visibleMonths < 36 && (
                                    <button
                                        onClick={() => setVisibleMonths((v) => Math.min(36, v + 6))}
                                        style={{
                                            width: 120,
                                            flexShrink: 0,
                                            padding: 16,
                                            border: "2px dashed #e4e4e7",
                                            borderRadius: 8,
                                            background: "transparent",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 8,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: "50%",
                                                background: "#18181b",
                                                color: "#ffffff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 20,
                                            }}
                                        >
                                            +
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                                            Add month
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Validation errors */}
                        {hasValidationErrors && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {validationErrors.map((error, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: 12,
                                            background: "#fef2f2",
                                            border: "1px solid #fecaca",
                                            borderRadius: 6,
                                            fontSize: 13,
                                            color: "#dc2626",
                                            display: "flex",
                                            gap: 8,
                                        }}
                                    >
                                        <span>⚠️</span>
                                        <span>{error.message}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* CTA */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button size="lg">Start application now</Button>
                        </div>

                        {/* Disclaimer */}
                        <p
                            style={{
                                fontSize: 12,
                                color: "#71717a",
                                textAlign: "center",
                                margin: "20px 0 0 0",
                            }}
                        >
                            This is <strong>not a final amount</strong>. It is a{" "}
                            <strong>quick estimate</strong> based on the information provided.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ElterngeldCalculatorV2

addPropertyControls(ElterngeldCalculatorV2, {})
