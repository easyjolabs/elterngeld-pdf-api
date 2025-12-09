import { useState } from "react"

const BRAND_COLOR = "#94D9DF"

export default function ElterngeldCalculator() {
    const [monthlyIncome, setMonthlyIncome] = useState(2000)
    const [workingHours, setWorkingHours] = useState(30)
    const [calculationMode, setCalculationMode] = useState<"income" | "hours">("income")

    // Calculate Elterngeld based on income
    const calculateElterngeld = () => {
        // Base calculation: 65-67% of net income
        // Simplified formula for demonstration
        let percentage = 67

        if (monthlyIncome > 1240) {
            percentage = 67 - ((monthlyIncome - 1240) / 2000) * 2
        }

        if (percentage < 65) percentage = 65

        const baseAmount = monthlyIncome * (percentage / 100)

        // Min 300€, Max 1800€
        if (baseAmount < 300) return 300
        if (baseAmount > 1800) return 1800

        return Math.round(baseAmount)
    }

    // Calculate reduced Elterngeld based on part-time work
    const calculateElterngeldPlus = () => {
        const fullElterngeld = calculateElterngeld()
        const reductionFactor = workingHours / 40 // Assuming 40h full-time
        const reducedIncome = monthlyIncome * (1 - reductionFactor)
        const elterngeldForReducedIncome = reducedIncome * 0.67

        const result = Math.min(elterngeldForReducedIncome, fullElterngeld)

        if (result < 300) return 300
        if (result > 1800) return 1800

        return Math.round(result)
    }

    const elterngeldAmount = calculationMode === "income"
        ? calculateElterngeld()
        : calculateElterngeldPlus()

    const monthlyTotal = calculationMode === "income"
        ? elterngeldAmount
        : elterngeldAmount + (monthlyIncome * workingHours / 40)

    return (
        <div style={{
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
            padding: "32px 24px",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .calc-container {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                    animation: slideUp 0.4s ease;
                }

                .calc-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                    text-align: center;
                }

                .calc-subtitle {
                    font-size: 15px;
                    color: #666;
                    margin-bottom: 32px;
                    text-align: center;
                }

                .calc-mode-switch {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 32px;
                    padding: 6px;
                    background: #f5f5f5;
                    border-radius: 12px;
                }

                .calc-mode-btn {
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: transparent;
                    color: #666;
                }

                .calc-mode-btn.active {
                    background: ${BRAND_COLOR};
                    color: white;
                    box-shadow: 0 2px 8px rgba(148, 217, 223, 0.3);
                }

                .calc-slider-section {
                    margin-bottom: 32px;
                }

                .calc-slider-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .calc-slider-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #333;
                }

                .calc-slider-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: ${BRAND_COLOR};
                }

                .calc-slider {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: linear-gradient(to right,
                        ${BRAND_COLOR} 0%,
                        ${BRAND_COLOR} ${calculationMode === "income"
                            ? (monthlyIncome / 5000) * 100
                            : (workingHours / 40) * 100}%,
                        #e0e0e0 ${calculationMode === "income"
                            ? (monthlyIncome / 5000) * 100
                            : (workingHours / 40) * 100}%,
                        #e0e0e0 100%);
                    outline: none;
                    -webkit-appearance: none;
                }

                .calc-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    border: 3px solid ${BRAND_COLOR};
                }

                .calc-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    border: 3px solid ${BRAND_COLOR};
                }

                .calc-result-card {
                    background: linear-gradient(135deg, ${BRAND_COLOR} 0%, #7BC5CC 100%);
                    border-radius: 16px;
                    padding: 24px;
                    text-align: center;
                    color: white;
                    margin-bottom: 24px;
                }

                .calc-result-label {
                    font-size: 14px;
                    opacity: 0.9;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .calc-result-amount {
                    font-size: 48px;
                    font-weight: 800;
                    margin-bottom: 4px;
                    line-height: 1;
                }

                .calc-result-period {
                    font-size: 14px;
                    opacity: 0.85;
                }

                .calc-breakdown {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                .calc-breakdown-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid #e0e0e0;
                }

                .calc-breakdown-row:last-child {
                    border-bottom: none;
                    padding-top: 16px;
                    font-weight: 700;
                }

                .calc-breakdown-label {
                    font-size: 14px;
                    color: #666;
                }

                .calc-breakdown-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: #333;
                }

                .calc-info {
                    background: #f0f9fa;
                    border-left: 4px solid ${BRAND_COLOR};
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 24px;
                }

                .calc-info-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 8px;
                }

                .calc-info-text {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.6;
                }

                .calc-cta-btn {
                    width: 100%;
                    padding: 16px 24px;
                    background: ${BRAND_COLOR};
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-top: 24px;
                    box-shadow: 0 4px 12px rgba(148, 217, 223, 0.3);
                }

                .calc-cta-btn:hover {
                    background: #7BC5CC;
                    box-shadow: 0 6px 16px rgba(148, 217, 223, 0.4);
                    transform: translateY(-2px);
                }

                .calc-cta-btn:active {
                    transform: translateY(0);
                }

                @media (max-width: 640px) {
                    .calc-container {
                        padding: 24px 20px;
                    }

                    .calc-title {
                        font-size: 24px;
                    }

                    .calc-result-amount {
                        font-size: 40px;
                    }
                }
            `}</style>

            <div className="calc-container">
                <h1 className="calc-title">Elterngeld Rechner</h1>
                <p className="calc-subtitle">
                    Berechnen Sie Ihr voraussichtliches Elterngeld
                </p>

                <div className="calc-mode-switch">
                    <button
                        className={`calc-mode-btn ${calculationMode === "income" ? "active" : ""}`}
                        onClick={() => setCalculationMode("income")}
                    >
                        Basis-Elterngeld
                    </button>
                    <button
                        className={`calc-mode-btn ${calculationMode === "hours" ? "active" : ""}`}
                        onClick={() => setCalculationMode("hours")}
                    >
                        ElterngeldPlus
                    </button>
                </div>

                <div className="calc-slider-section">
                    <div className="calc-slider-label">
                        <span className="calc-slider-title">
                            {calculationMode === "income"
                                ? "Monatliches Nettoeinkommen"
                                : "Arbeitszeit pro Woche"}
                        </span>
                        <span className="calc-slider-value">
                            {calculationMode === "income"
                                ? `${monthlyIncome.toLocaleString("de-DE")} €`
                                : `${workingHours}h`}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={calculationMode === "income" ? 0 : 0}
                        max={calculationMode === "income" ? 5000 : 40}
                        step={calculationMode === "income" ? 50 : 1}
                        value={calculationMode === "income" ? monthlyIncome : workingHours}
                        onChange={(e) => {
                            if (calculationMode === "income") {
                                setMonthlyIncome(parseInt(e.target.value))
                            } else {
                                setWorkingHours(parseInt(e.target.value))
                            }
                        }}
                        className="calc-slider"
                    />
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        color: "#999",
                        marginTop: "8px"
                    }}>
                        <span>{calculationMode === "income" ? "0 €" : "0h"}</span>
                        <span>{calculationMode === "income" ? "5.000 €" : "40h"}</span>
                    </div>
                </div>

                {calculationMode === "hours" && (
                    <div className="calc-slider-section">
                        <div className="calc-slider-label">
                            <span className="calc-slider-title">Monatliches Nettoeinkommen</span>
                            <span className="calc-slider-value">
                                {monthlyIncome.toLocaleString("de-DE")} €
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={5000}
                            step={50}
                            value={monthlyIncome}
                            onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
                            className="calc-slider"
                        />
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            color: "#999",
                            marginTop: "8px"
                        }}>
                            <span>0 €</span>
                            <span>5.000 €</span>
                        </div>
                    </div>
                )}

                <div className="calc-result-card">
                    <div className="calc-result-label">
                        Ihr voraussichtliches Elterngeld
                    </div>
                    <div className="calc-result-amount">
                        {elterngeldAmount.toLocaleString("de-DE")} €
                    </div>
                    <div className="calc-result-period">pro Monat</div>
                </div>

                {calculationMode === "hours" && (
                    <div className="calc-breakdown">
                        <div className="calc-breakdown-row">
                            <span className="calc-breakdown-label">Teilzeit-Einkommen</span>
                            <span className="calc-breakdown-value">
                                {Math.round(monthlyIncome * workingHours / 40).toLocaleString("de-DE")} €
                            </span>
                        </div>
                        <div className="calc-breakdown-row">
                            <span className="calc-breakdown-label">ElterngeldPlus</span>
                            <span className="calc-breakdown-value">
                                {elterngeldAmount.toLocaleString("de-DE")} €
                            </span>
                        </div>
                        <div className="calc-breakdown-row">
                            <span className="calc-breakdown-label">Gesamt monatlich</span>
                            <span className="calc-breakdown-value" style={{ color: BRAND_COLOR }}>
                                {monthlyTotal.toLocaleString("de-DE")} €
                            </span>
                        </div>
                    </div>
                )}

                <div className="calc-info">
                    <div className="calc-info-title">ℹ️ Wichtiger Hinweis</div>
                    <div className="calc-info-text">
                        {calculationMode === "income"
                            ? "Dies ist eine vereinfachte Berechnung. Der tatsächliche Betrag kann je nach individueller Situation abweichen. Basis-Elterngeld: 65-67% des Nettoeinkommens, mindestens 300 €, maximal 1.800 €."
                            : "ElterngeldPlus ermöglicht Ihnen, länger Elterngeld zu beziehen bei gleichzeitiger Teilzeitarbeit (max. 32h/Woche). Sie erhalten die Hälfte des Basis-Elterngeldes, aber über den doppelten Zeitraum."
                        }
                    </div>
                </div>

                <button className="calc-cta-btn">
                    Jetzt Antrag stellen →
                </button>
            </div>
        </div>
    )
}
