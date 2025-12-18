import { addPropertyControls } from "framer"
import { useMemo, useState, useRef } from "react"

type MonthPlan = {
    parent1Type: "basis" | "plus" | "none"
    parent2Type: "basis" | "plus" | "partnership" | "none"
}

/**
 * Step 1: Info modals, English text, max amount notice
 * Step 2: Info text about month selection rules
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function ElterngeldCalculator() {
    const [currentStep, setCurrentStep] = useState<1 | 2>(1)

    // ✅ default slider value = 0
    const [income, setIncome] = useState(0)

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

    const [showSiblingModal, setShowSiblingModal] = useState(false)
    const [showMultipleModal, setShowMultipleModal] = useState(false)
    const [showIncomeInfoModal, setShowIncomeInfoModal] = useState(false)

    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const SLIDER_MAX = 7000

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

    const setMonthType = (
        monthIndex: number,
        parent: 1 | 2,
        type: MonthPlan["parent1Type"] | MonthPlan["parent2Type"]
    ) => {
        setMonthPlans((prev) => {
            const next = [...prev]
            const current = next[monthIndex]
            if (parent === 1) {
                next[monthIndex] = {
                    ...current,
                    parent1Type: type as MonthPlan["parent1Type"],
                }
            } else {
                next[monthIndex] = {
                    ...current,
                    parent2Type: type as MonthPlan["parent2Type"],
                }
            }
            return next
        })
    }

    const toggleCheckbox = (
        monthIndex: number,
        parent: 1 | 2,
        desired: "basis" | "plus"
    ) => {
        const current = monthPlans[monthIndex]
        if (parent === 1) {
            const nextType = current.parent1Type === desired ? "none" : desired
            setMonthType(monthIndex, 1, nextType)
        } else {
            const nextType = current.parent2Type === desired ? "none" : desired
            setMonthType(monthIndex, 2, nextType)
        }
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

    const scrollOneBoxRight = () => {
        if (scrollContainerRef.current) {
            const boxWidth = 90 + 12 // 90px width + 12px gap
            scrollContainerRef.current.scrollBy({
                left: boxWidth,
                behavior: "smooth",
            })
        }
    }

    const isAtScrollEnd = () => {
        if (!scrollContainerRef.current) return true
        const container = scrollContainerRef.current
        return (
            container.scrollLeft >=
            container.scrollWidth - container.clientWidth - 10
        )
    }

    const [showScrollButton, setShowScrollButton] = useState(true)

    const handleScroll = () => {
        setShowScrollButton(!isAtScrollEnd())
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

    useMemo(() => {
        // keep existing memo side effects/values as in your original (not used further)
        return null
    }, [monthPlans, result.basis, result.plus])

    const canAddMoreMonths = visibleMonths < 36

    const Modal = ({
        isOpen,
        onClose,
        title,
        children,
    }: {
        isOpen: boolean
        onClose: () => void
        title: string
        children: React.ReactNode
    }) => {
        if (!isOpen) return null

        return (
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: 16,
                        padding: 24,
                        maxWidth: 500,
                        width: "90%",
                        maxHeight: "80vh",
                        overflow: "auto",
                        boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 16,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 18,
                                fontWeight: 900,
                                color: "#1a1a1a",
                                margin: 0,
                            }}
                        >
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: 24,
                                cursor: "pointer",
                                color: "#9a9a9a",
                                padding: 0,
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            color: "#374151",
                            lineHeight: 1.6,
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        )
    }

    const Stepper = () => {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
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

                <div
                    style={{
                        width: 40,
                        height: 1,
                        background: "#e1e1e1",
                    }}
                />

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
                className="eg-container"
                style={{
                    width: "100%",
                    minHeight: "100%",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e1e1e1",
                    borderRadius: 20,
                    padding: 30,
                    boxSizing: "border-box",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header with Stepper and navigation button */}
                <div
                    className="eg-header"
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
                    <Stepper />

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

                {/* Full-width divider - aligned with chat header line */}
                <div
                    style={{
                        height: 1,
                        background: "#e5e7eb",
                        marginLeft: -30,
                        marginRight: -30,
                        marginBottom: 18,
                    }}
                />

                {/* Modals */}
                <Modal
                    isOpen={showSiblingModal}
                    onClose={() => setShowSiblingModal(false)}
                    title="Sibling Bonus"
                >
                    <p>
                        If you have <strong>1 child under 3 years old</strong>,
                        or <strong>2 children under 6 years old</strong>, or{" "}
                        <strong>
                            1 child with a disability under 14 years old
                        </strong>
                        , you may receive an additional <strong>+10%</strong>,
                        with a minimum of <strong>+75 € per month</strong>.
                    </p>
                </Modal>

                <Modal
                    isOpen={showMultipleModal}
                    onClose={() => setShowMultipleModal(false)}
                    title="Multiple Births Bonus"
                >
                    <p>
                        You receive an additional{" "}
                        <strong>+300 € per month</strong> for each additional
                        child <strong>born at the same time</strong> (e.g.,
                        twins or triplets).
                    </p>
                </Modal>

                <Modal
                    isOpen={showIncomeInfoModal}
                    onClose={() => setShowIncomeInfoModal(false)}
                    title="Income Calculation"
                >
                    <p>
                        Please calculate your combined monthly average net
                        income from the 12 months before birth, or the calendar
                        year before birth if you are self-employed.
                    </p>
                </Modal>

                {/* STEP 1 */}
                {currentStep === 1 && (
                    <div
                        style={{
                            width: "100%",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
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
                            {/* Slider (65%) + Result card (35%) */}
                            <div
                                className="eg-step1-slider-row"
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "70% 30%",
                                    gap: 18,
                                    alignItems: "start",
                                }}
                            >
                                {/* Slider card */}
                                <div
                                    style={{
                                        padding: 28,
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 14,
                                        background: "#fafafa",
                                        display: "flex",
                                        flexDirection: "column",
                                        minHeight: 350,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#111827",
                                            marginBottom: 4,
                                        }}
                                    >
                                        Net Income
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
                                        <input
                                            type="range"
                                            min={0}
                                            max={SLIDER_MAX}
                                            step={50}
                                            value={income}
                                            onChange={(e) =>
                                                setIncome(
                                                    Number(e.target.value)
                                                )
                                            }
                                            style={{
                                                width: "100%",
                                                height: 2,
                                                WebkitAppearance: "none",
                                                appearance: "none",
                                                background: `linear-gradient(to right, #111827 0%, #111827 ${
                                                    (income / SLIDER_MAX) * 100
                                                }%, #e5e7eb ${
                                                    (income / SLIDER_MAX) * 100
                                                }%, #e5e7eb 100%)`,
                                                outline: "none",
                                                borderRadius: 999,
                                                cursor: "pointer",
                                            }}
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

                                    {/* Checkboxes at bottom */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gap: 8,
                                            marginTop: 20,
                                            minHeight: 120,
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 10,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={siblingBonus}
                                                onChange={(e) =>
                                                    setSiblingBonus(
                                                        e.target.checked
                                                    )
                                                }
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    cursor: "pointer",
                                                    accentColor: "#111827",
                                                    flexShrink: 0,
                                                    marginTop: 2,
                                                }}
                                            />
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#111827",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Include sibling bonus
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#6b7280",
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    If you have 1 child under 3
                                                    years old, or 2 children
                                                    under 6 years old, or 1
                                                    child with a disability
                                                    under 14 years old
                                                </div>
                                            </div>
                                        </label>

                                        <label
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: 10,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={multipleChildren}
                                                onChange={(e) =>
                                                    setMultipleChildren(
                                                        e.target.checked
                                                    )
                                                }
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    cursor: "pointer",
                                                    accentColor: "#111827",
                                                    flexShrink: 0,
                                                    marginTop: 2,
                                                }}
                                            />
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 13,
                                                        fontWeight: 600,
                                                        color: "#111827",
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Include bonus for multiple
                                                    births
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#6b7280",
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    If you expect multiple
                                                    childs (e.g., twins or
                                                    triplets)
                                                </div>
                                            </div>
                                        </label>

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

                                    {/* Income hint box below checkboxes */}
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

                                {/* Result card (smaller fonts + 2-column layout per row) */}
                                <div
                                    style={{
                                        border: "1px solid #e5e7eb",
                                        borderRadius: 14,
                                        padding: 24,
                                        background: "#ffffff",
                                        minHeight: 380,
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    {/* Basis */}
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

                                    {/* Divider */}
                                    <div
                                        style={{
                                            borderTop: "1px solid #e5e7eb",
                                            marginBottom: 20,
                                        }}
                                    />

                                    {/* Plus */}
                                    <div>
                                        <div>
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
                                    </div>

                                    {/* Plan next button */}
                                    <button
                                        onClick={() => setCurrentStep(2)}
                                        style={{
                                            width: "100%",
                                            height: 100,
                                            borderRadius: 10,
                                            border: "#000000",
                                            background: "#FE6318",
                                            cursor: "pointer",
                                            fontSize: 13,
                                            fontWeight: 900,
                                            color: "#000000",
                                            marginTop: 50,
                                        }}
                                    >
                                        Plan next
                                    </button>
                                </div>
                            </div>

                            {/* Legal text: centered at the very bottom (no line) */}
                            <div style={{ marginTop: "auto", paddingTop: 8 }}>
                                <div
                                    style={{
                                        fontSize: 11,
                                        lineHeight: 1.5,
                                        color: "#6b7280",
                                        textAlign: "center",
                                    }}
                                >
                                    This is <strong>not a final amount</strong>.
                                    It is a <strong>quick estimate</strong>{" "}
                                    based on the information provided.
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                    <div
                        style={{
                            width: "100%",
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            className="eg-step2-header"
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                gap: 16,
                                marginBottom: 16,
                                flexWrap: "wrap",
                            }}
                        >
                            <div>
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
                            </div>

                            {/* Birthday input and single parent checkbox */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        position: "relative",
                                        minWidth: 160,
                                    }}
                                >
                                    <input
                                        id="child-birthday-input"
                                        type="date"
                                        value={childBirthDate}
                                        onChange={(e) =>
                                            setChildBirthDate(e.target.value)
                                        }
                                        style={{
                                            width: "100%",
                                            height: 40,
                                            padding: "0 12px",
                                            borderRadius: 10,
                                            border: "1px solid #e1e1e1",
                                            background: "#ffffff",
                                            fontSize: 13,
                                            color: childBirthDate
                                                ? "#1a1a1a"
                                                : "transparent",
                                            cursor: "pointer",
                                        }}
                                    />
                                    {!childBirthDate && (
                                        <div
                                            onClick={() => {
                                                const input =
                                                    document.getElementById(
                                                        "child-birthday-input"
                                                    ) as HTMLInputElement
                                                if (input) {
                                                    input.click()
                                                    input.focus()
                                                }
                                            }}
                                            style={{
                                                position: "absolute",
                                                left: 12,
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                fontSize: 13,
                                                fontWeight: 600,
                                                color: "#1a1a1a",
                                                cursor: "pointer",
                                                pointerEvents: "auto",
                                            }}
                                        >
                                            Child's Birthday
                                        </div>
                                    )}
                                </div>

                                <label
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        cursor: "pointer",
                                        height: 40,
                                        padding: "0 12px",
                                        borderRadius: 10,
                                        border: "1px solid #e1e1e1",
                                        background: "#ffffff",
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSingleParent}
                                        onChange={(e) =>
                                            setIsSingleParent(e.target.checked)
                                        }
                                        style={{
                                            width: 16,
                                            height: 16,
                                            cursor: "pointer",
                                            accentColor: "#111827",
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: "#1a1a1a",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        I am a single parent
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* MONTHS SCROLLER */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            style={{
                                width: "100%",
                                overflowX: "auto",
                                overflowY: "hidden",
                                WebkitOverflowScrolling: "touch",
                                paddingBottom: 16,
                                position: "relative",
                                maxHeight: "380px",
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
                                                    width: 90,
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
                                                    minHeight: 320,
                                                }}
                                            >
                                                {/* Top section: Month + Date + Divider */}
                                                <div>
                                                    <div
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: 900,
                                                            color: "#1a1a1a",
                                                            marginBottom: 4,
                                                        }}
                                                    >
                                                        Month {index + 1}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 10,
                                                            color: "#9a9a9a",
                                                            marginBottom: 12,
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

                                                {/* Middle section: Checkboxes */}
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
                                                                paddingTop: 12,
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

                                                {/* Bottom section: Amount */}
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
                                            width: 90,
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
                                            minHeight: 320,
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor =
                                                "#1a1a1a"
                                            e.currentTarget.style.background =
                                                "#f5f5f5"
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor =
                                                "#e1e1e1"
                                            e.currentTarget.style.background =
                                                "#fafafa"
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

                        {/* Error container with fixed space */}
                        <div
                            style={{
                                marginTop: 8,
                                minHeight: 50,
                            }}
                        >
                            {hasValidationErrors && (
                                <div>
                                    {validationErrors.map((error, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                color: "#dc2626",
                                                fontSize: 12,
                                                lineHeight: 1.5,
                                                marginBottom:
                                                    index <
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

                        {/* Legal text: centered at the very bottom */}
                        <div style={{ marginTop: "auto", paddingTop: 8 }}>
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

                    /* Tablet breakpoint */
                    @media (max-width: 768px) {
                        .eg-container {
                            padding: 20px !important;
                            border-radius: 16px !important;
                        }

                        .eg-step1-slider-row {
                            grid-template-columns: 1fr !important;
                            gap: 16px !important;
                        }

                        .eg-step1-bottom-row {
                            grid-template-columns: 1fr !important;
                        }

                        .eg-step2-header {
                            flex-direction: column !important;
                            align-items: flex-start !important;
                            gap: 12px !important;
                        }
                    }

                    /* Mobile breakpoint */
                    @media (max-width: 480px) {
                        .eg-container {
                            padding: 16px !important;
                            border-radius: 12px !important;
                        }

                        .eg-header {
                            padding-bottom: 16px !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    )
}

addPropertyControls(ElterngeldCalculator, {})
