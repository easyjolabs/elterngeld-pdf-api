import { useState, useRef } from "react"
import { addPropertyControls, ControlType } from "framer"

// ============================================
// TYPES
// ============================================

type MonthPlan = {
    parent1Type: "basis" | "plus" | "none"
    parent2Type: "basis" | "plus" | "none"
}

// ============================================
// ATTIO-STYLE COMPONENTS
// ============================================

const Button = ({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled = false,
}: {
    children: React.ReactNode
    onClick?: () => void
    variant?: "primary" | "secondary" | "ghost"
    size?: "sm" | "md" | "lg"
    disabled?: boolean
}) => {
    const variants = {
        primary: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#ffffff",
            border: "none",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
        },
        secondary: {
            background: "#ffffff",
            color: "#1e293b",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        },
        ghost: {
            background: "transparent",
            color: "#64748b",
            border: "1px solid transparent",
            boxShadow: "none",
        },
    }

    const sizes = {
        sm: { height: 36, padding: "0 16px", fontSize: 14 },
        md: { height: 44, padding: "0 24px", fontSize: 15 },
        lg: { height: 52, padding: "0 32px", fontSize: 16 },
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                ...variants[variant],
                ...sizes[size],
                borderRadius: 12,
                fontWeight: 600,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.2s ease",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
                if (!disabled && variant === "primary") {
                    e.currentTarget.style.transform = "translateY(-1px)"
                    e.currentTarget.style.boxShadow =
                        "0 6px 16px rgba(102, 126, 234, 0.35)"
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow =
                        variant === "primary"
                            ? "0 4px 12px rgba(102, 126, 234, 0.25)"
                            : variants[variant].boxShadow
                }
            }}
        >
            {children}
        </button>
    )
}

const Card = ({ children }: { children: React.ReactNode }) => {
    return (
        <div
            style={{
                background: "#ffffff",
                borderRadius: 16,
                padding: 32,
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                border: "1px solid #f1f5f9",
            }}
        >
            {children}
        </div>
    )
}

const Checkbox = ({
    checked,
    onChange,
    label,
    description,
}: {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    description?: string
}) => {
    return (
        <label
            style={{
                display: "flex",
                gap: 12,
                cursor: "pointer",
                alignItems: "flex-start",
            }}
        >
            <div
                onClick={() => onChange(!checked)}
                style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: checked
                        ? "2px solid #667eea"
                        : "2px solid #cbd5e1",
                    background: checked
                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                    transition: "all 0.2s ease",
                }}
            >
                {checked && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
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
                                fontSize: 15,
                                fontWeight: 500,
                                color: "#1e293b",
                                marginBottom: description ? 4 : 0,
                            }}
                        >
                            {label}
                        </div>
                    )}
                    {description && (
                        <div
                            style={{
                                fontSize: 14,
                                color: "#64748b",
                                lineHeight: 1.5,
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
    onChange,
    min = 0,
    max = 100,
    step = 1,
}: {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
}) => {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div style={{ width: "100%", padding: "12px 0" }}>
            <input
                type="range"
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                style={{
                    width: "100%",
                    height: 8,
                    borderRadius: 999,
                    appearance: "none",
                    background: `linear-gradient(to right,
                        #667eea 0%,
                        #764ba2 ${percentage}%,
                        #e2e8f0 ${percentage}%,
                        #e2e8f0 100%)`,
                    outline: "none",
                    cursor: "pointer",
                }}
            />
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                    transition: all 0.2s ease;
                }
                input[type="range"]::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }
                input[type="range"]::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    cursor: pointer;
                    border: 3px solid #ffffff;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                }
            `}</style>
        </div>
    )
}

// ============================================
// MAIN CALCULATOR
// ============================================

function ElterngeldCalculatorAttio() {
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
    const scrollRef = useRef<HTMLDivElement>(null)

    const SLIDER_MAX = 7000

    // Calculations
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

    const computeMonthTotal = (plan: MonthPlan) => {
        let total = 0
        if (plan.parent1Type === "basis") total += result.basis
        if (plan.parent1Type === "plus") total += result.plus
        if (plan.parent2Type === "basis") total += result.basis
        if (plan.parent2Type === "plus") total += result.plus
        return total
    }

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
            if (parent1BasisMonths > 0 && parent1BasisMonths < 2) {
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

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif',
                padding: "48px 24px",
                boxSizing: "border-box",
            }}
        >
            <div
                style={{
                    maxWidth: 1100,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 32,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    {/* Steps */}
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background:
                                        currentStep === 1
                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                            : "#e2e8f0",
                                    color: currentStep === 1 ? "#ffffff" : "#94a3b8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 15,
                                    fontWeight: 700,
                                    boxShadow:
                                        currentStep === 1
                                            ? "0 4px 12px rgba(102, 126, 234, 0.25)"
                                            : "none",
                                }}
                            >
                                1
                            </div>
                            <span
                                style={{
                                    fontSize: 15,
                                    fontWeight: currentStep === 1 ? 600 : 500,
                                    color: currentStep === 1 ? "#1e293b" : "#64748b",
                                }}
                            >
                                Calculator
                            </span>
                        </div>
                        <div
                            style={{
                                width: 32,
                                height: 2,
                                background: "#e2e8f0",
                                borderRadius: 999,
                            }}
                        />
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "50%",
                                    background:
                                        currentStep === 2
                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                            : "#e2e8f0",
                                    color: currentStep === 2 ? "#ffffff" : "#94a3b8",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 15,
                                    fontWeight: 700,
                                    boxShadow:
                                        currentStep === 2
                                            ? "0 4px 12px rgba(102, 126, 234, 0.25)"
                                            : "none",
                                }}
                            >
                                2
                            </div>
                            <span
                                style={{
                                    fontSize: 15,
                                    fontWeight: currentStep === 2 ? 600 : 500,
                                    color: currentStep === 2 ? "#1e293b" : "#64748b",
                                }}
                            >
                                Planner
                            </span>
                        </div>
                    </div>

                    {/* Navigation */}
                    {currentStep === 1 ? (
                        <Button onClick={() => setCurrentStep(2)}>Next →</Button>
                    ) : (
                        <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                            ← Back
                        </Button>
                    )}
                </div>

                {/* Step 1: Calculator */}
                {currentStep === 1 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        <div>
                            <h1
                                style={{
                                    fontSize: 36,
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    margin: "0 0 8px 0",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Calculate your Elterngeld
                            </h1>
                            <p
                                style={{
                                    fontSize: 16,
                                    color: "#64748b",
                                    margin: 0,
                                }}
                            >
                                Get an instant estimate of your parental allowance
                            </p>
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1.8fr 1fr",
                                gap: 24,
                            }}
                        >
                            {/* Income Card */}
                            <Card>
                                <h3
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: "#1e293b",
                                        margin: "0 0 6px 0",
                                    }}
                                >
                                    Monthly net income
                                </h3>
                                <p
                                    style={{
                                        fontSize: 14,
                                        color: "#64748b",
                                        margin: "0 0 24px 0",
                                    }}
                                >
                                    Average over the 12 months before birth
                                </p>

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
                                        marginBottom: 32,
                                    }}
                                >
                                    <span style={{ fontSize: 14, color: "#94a3b8" }}>
                                        €0
                                    </span>
                                    <span
                                        style={{
                                            fontSize: 24,
                                            fontWeight: 700,
                                            color: "#667eea",
                                        }}
                                    >
                                        €{income.toLocaleString("de-DE")}
                                    </span>
                                    <span style={{ fontSize: 14, color: "#94a3b8" }}>
                                        €{SLIDER_MAX.toLocaleString("de-DE")}
                                    </span>
                                </div>

                                {/* Bonuses */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                                    <Checkbox
                                        checked={siblingBonus}
                                        onChange={setSiblingBonus}
                                        label="Include sibling bonus"
                                        description="If you have 1 child under 3, or 2 children under 6, or 1 disabled child under 14"
                                    />

                                    <Checkbox
                                        checked={multipleChildren}
                                        onChange={setMultipleChildren}
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
                                                padding: "10px 14px",
                                                fontSize: 15,
                                                border: "1px solid #e2e8f0",
                                                borderRadius: 10,
                                                background: "#ffffff",
                                                cursor: "pointer",
                                                color: "#1e293b",
                                                width: 200,
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
                                            marginTop: 24,
                                            padding: 16,
                                            background:
                                                "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
                                            border: "1px solid #c4b5fd",
                                            borderRadius: 12,
                                            fontSize: 14,
                                            color: "#5b21b6",
                                            lineHeight: 1.6,
                                            display: "flex",
                                            gap: 12,
                                        }}
                                    >
                                        <span>💡</span>
                                        <span>
                                            Maximum Elterngeld of €1,800 reached. Income above
                                            ~€2,770/month doesn't increase the amount.
                                        </span>
                                    </div>
                                )}
                            </Card>

                            {/* Results Card */}
                            <Card>
                                <div style={{ marginBottom: 28 }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "#64748b",
                                            marginBottom: 8,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Basiselterngeld
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 40,
                                            fontWeight: 700,
                                            background:
                                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {result.isOverLimit
                                            ? "€0"
                                            : `€${result.basis.toLocaleString("de-DE")}`}
                                    </div>
                                    <div style={{ fontSize: 14, color: "#64748b" }}>
                                        for 12–14 months
                                    </div>
                                </div>

                                <div
                                    style={{
                                        height: 1,
                                        background: "#e2e8f0",
                                        margin: "28px 0",
                                    }}
                                />

                                <div>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            color: "#64748b",
                                            marginBottom: 8,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            fontWeight: 600,
                                        }}
                                    >
                                        ElterngeldPlus
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 40,
                                            fontWeight: 700,
                                            background:
                                                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            marginBottom: 4,
                                        }}
                                    >
                                        {result.isOverLimit
                                            ? "€0"
                                            : `€${result.plus.toLocaleString("de-DE")}`}
                                    </div>
                                    <div style={{ fontSize: 14, color: "#64748b" }}>
                                        for 24–28 months
                                    </div>
                                </div>

                                {result.isOverLimit && (
                                    <div
                                        style={{
                                            marginTop: 24,
                                            padding: 16,
                                            background: "#fef2f2",
                                            border: "1px solid #fecaca",
                                            borderRadius: 12,
                                            fontSize: 14,
                                            color: "#dc2626",
                                        }}
                                    >
                                        Income exceeds €175,000 annual limit
                                    </div>
                                )}
                            </Card>
                        </div>

                        <p
                            style={{
                                fontSize: 13,
                                color: "#94a3b8",
                                textAlign: "center",
                                margin: "16px 0 0 0",
                            }}
                        >
                            This is <strong>not a final amount</strong>. It is a{" "}
                            <strong>quick estimate</strong> based on the information provided.
                        </p>
                    </div>
                )}

                {/* Step 2: Planner */}
                {currentStep === 2 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                        <div>
                            <h1
                                style={{
                                    fontSize: 36,
                                    fontWeight: 700,
                                    color: "#0f172a",
                                    margin: "0 0 8px 0",
                                    letterSpacing: "-0.02em",
                                }}
                            >
                                Plan your months
                            </h1>
                            <p
                                style={{
                                    fontSize: 16,
                                    color: "#64748b",
                                    margin: 0,
                                }}
                            >
                                Distribute your Elterngeld over the available months
                            </p>
                        </div>

                        {/* Inputs */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                            <input
                                type="date"
                                value={childBirthDate}
                                onChange={(e) => setChildBirthDate(e.target.value)}
                                style={{
                                    padding: "12px 16px",
                                    fontSize: 15,
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 10,
                                    background: "#ffffff",
                                    cursor: "pointer",
                                    color: "#1e293b",
                                }}
                            />
                            <label
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    padding: "12px 16px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: 10,
                                    background: "#ffffff",
                                    cursor: "pointer",
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSingleParent}
                                    onChange={(e) => setIsSingleParent(e.target.checked)}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        cursor: "pointer",
                                        accentColor: "#667eea",
                                    }}
                                />
                                <span style={{ fontSize: 15, fontWeight: 500 }}>
                                    I am a single parent
                                </span>
                            </label>
                        </div>

                        {/* Month boxes */}
                        <div
                            ref={scrollRef}
                            style={{
                                overflowX: "auto",
                                paddingBottom: 16,
                            }}
                        >
                            <div style={{ display: "flex", gap: 16, minWidth: "min-content" }}>
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
                                                width: 140,
                                                flexShrink: 0,
                                                padding: 20,
                                                border: hasError
                                                    ? "2px solid #f87171"
                                                    : "1px solid #e2e8f0",
                                                borderRadius: 12,
                                                background: hasError ? "#fef2f2" : "#ffffff",
                                                boxShadow: hasError
                                                    ? "0 4px 12px rgba(248, 113, 113, 0.15)"
                                                    : "0 1px 3px rgba(0, 0, 0, 0.05)",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 16,
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 16,
                                                        fontWeight: 700,
                                                        color: "#1e293b",
                                                    }}
                                                >
                                                    Month {index + 1}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#94a3b8",
                                                    }}
                                                >
                                                    {dateRange}
                                                </div>
                                            </div>

                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                        marginBottom: 8,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    You
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                    <label
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
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
                                                                width: 16,
                                                                height: 16,
                                                                cursor: "pointer",
                                                                accentColor: "#667eea",
                                                            }}
                                                        />
                                                        <span style={{ fontSize: 14 }}>Basis</span>
                                                    </label>
                                                    <label
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 8,
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
                                                                width: 16,
                                                                height: 16,
                                                                cursor: "pointer",
                                                                accentColor: "#667eea",
                                                            }}
                                                        />
                                                        <span style={{ fontSize: 14 }}>Plus</span>
                                                    </label>
                                                </div>
                                            </div>

                                            {!isSingleParent && (
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 12,
                                                            color: "#64748b",
                                                            marginBottom: 8,
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Partner
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                        <label
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
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
                                                                    width: 16,
                                                                    height: 16,
                                                                    cursor: "pointer",
                                                                    accentColor: "#667eea",
                                                                }}
                                                            />
                                                            <span style={{ fontSize: 14 }}>Basis</span>
                                                        </label>
                                                        <label
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 8,
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
                                                                    width: 16,
                                                                    height: 16,
                                                                    cursor: "pointer",
                                                                    accentColor: "#667eea",
                                                                }}
                                                            />
                                                            <span style={{ fontSize: 14 }}>Plus</span>
                                                        </label>
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                style={{
                                                    marginTop: "auto",
                                                    paddingTop: 16,
                                                    borderTop: "1px solid #e2e8f0",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#64748b",
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    Amount
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 18,
                                                        fontWeight: 700,
                                                        color: amount ? "#667eea" : "#cbd5e1",
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
                                            width: 140,
                                            flexShrink: 0,
                                            padding: 20,
                                            border: "2px dashed #cbd5e1",
                                            borderRadius: 12,
                                            background: "transparent",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 12,
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = "#667eea"
                                            e.currentTarget.style.background =
                                                "rgba(102, 126, 234, 0.05)"
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = "#cbd5e1"
                                            e.currentTarget.style.background = "transparent"
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "50%",
                                                background:
                                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                color: "#ffffff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: 20,
                                            }}
                                        >
                                            +
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                                            Add month
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Validation errors */}
                        {validationErrors.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {validationErrors.map((error, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: 16,
                                            background: "#fef2f2",
                                            border: "1px solid #fecaca",
                                            borderRadius: 12,
                                            fontSize: 14,
                                            color: "#dc2626",
                                            display: "flex",
                                            gap: 12,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        <span style={{ fontSize: 18 }}>⚠️</span>
                                        <span style={{ flex: 1, lineHeight: 1.5 }}>{error}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* CTA */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button size="lg">Start application now →</Button>
                        </div>

                        <p
                            style={{
                                fontSize: 13,
                                color: "#94a3b8",
                                textAlign: "center",
                                margin: "16px 0 0 0",
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

export default ElterngeldCalculatorAttio

addPropertyControls(ElterngeldCalculatorAttio, {})
