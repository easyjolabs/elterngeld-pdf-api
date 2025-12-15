import { useState } from "react"

const BRAND_COLOR = "#94D9DF"
const BRAND_DARK = "#7BC5CC"

export default function ElterngeldPlaner() {
    // State für Eingaben
    const [monthlyIncome, setMonthlyIncome] = useState(2000)
    const [hasPartner, setHasPartner] = useState(false)
    const [partnerIncome, setPartnerIncome] = useState(1500)
    const [hasSibling, setHasSibling] = useState(false)
    const [hasMultiples, setHasMultiples] = useState(false)
    const [showIncomeInfo, setShowIncomeInfo] = useState(false)

    // Modell-Planer State
    const [selectedModel, setSelectedModel] = useState<"basis" | "plus" | "mix">("basis")
    const [showModelInfo, setShowModelInfo] = useState(false)

    // Berechnung Elterngeld
    const calculateElterngeld = (income: number) => {
        let percentage = 67

        if (income > 1240) {
            percentage = 67 - ((income - 1240) / 2000) * 2
        }
        if (percentage < 65) percentage = 65

        let baseAmount = income * (percentage / 100)

        // Geschwisterbonus: +10% (mind. 75€)
        if (hasSibling) {
            const bonus = Math.max(baseAmount * 0.1, 75)
            baseAmount += bonus
        }

        // Mehrlingszuschlag: +300€ pro weiterem Kind
        if (hasMultiples) {
            baseAmount += 300
        }

        // Min 300€, Max 1800€
        if (baseAmount < 300) return 300
        if (baseAmount > 1800) return 1800

        return Math.round(baseAmount)
    }

    const totalIncome = hasPartner ? monthlyIncome + partnerIncome : monthlyIncome
    const incomeLimit = 175000
    const isOverLimit = totalIncome * 12 > incomeLimit
    const elterngeldAmount = calculateElterngeld(monthlyIncome)

    // Dauer je nach Modell
    const getDuration = () => {
        switch (selectedModel) {
            case "basis":
                return { months: 12, plusMonths: 2, total: 14 }
            case "plus":
                return { months: 0, plusMonths: 28, total: 28 }
            case "mix":
                return { months: 6, plusMonths: 14, total: 20 }
            default:
                return { months: 12, plusMonths: 2, total: 14 }
        }
    }

    const duration = getDuration()

    return (
        <div style={{
            width: "100%",
            maxWidth: "900px",
            margin: "0 auto",
            padding: "24px 20px",
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        }}>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                * {
                    box-sizing: border-box;
                }

                .planer-container {
                    animation: slideUp 0.4s ease;
                }

                .planer-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .planer-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin-bottom: 8px;
                }

                .planer-subtitle {
                    font-size: 16px;
                    color: #666;
                }

                .planer-section {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
                }

                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a1a1a;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .info-button {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: ${BRAND_COLOR};
                    color: white;
                    border: none;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .info-button:hover {
                    background: ${BRAND_DARK};
                    transform: scale(1.1);
                }

                .info-box {
                    background: #f0f9fa;
                    border-left: 4px solid ${BRAND_COLOR};
                    border-radius: 8px;
                    padding: 16px;
                    margin-top: 12px;
                    animation: slideUp 0.3s ease;
                }

                .info-box-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 8px;
                }

                .info-box-text {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.6;
                    margin-bottom: 8px;
                }

                .info-box-text:last-child {
                    margin-bottom: 0;
                }

                .slider-wrapper {
                    margin-bottom: 24px;
                }

                .slider-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .slider-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }

                .slider-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: ${BRAND_COLOR};
                }

                .slider {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: #e0e0e0;
                    outline: none;
                    -webkit-appearance: none;
                }

                .slider::-webkit-slider-thumb {
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

                .slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    border: 3px solid ${BRAND_COLOR};
                }

                .slider-track {
                    width: 100%;
                    height: 8px;
                    border-radius: 4px;
                    background: linear-gradient(to right,
                        ${BRAND_COLOR} 0%,
                        ${BRAND_COLOR} calc(${monthlyIncome / 5000 * 100}%),
                        #e0e0e0 calc(${monthlyIncome / 5000 * 100}%),
                        #e0e0e0 100%);
                }

                .slider-range {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: #999;
                    margin-top: 8px;
                }

                .toggle-options {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                    margin-top: 16px;
                }

                .toggle-card {
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: white;
                }

                .toggle-card:hover {
                    border-color: ${BRAND_COLOR};
                    box-shadow: 0 2px 8px rgba(148, 217, 223, 0.2);
                }

                .toggle-card.active {
                    border-color: ${BRAND_COLOR};
                    background: #f0f9fa;
                    box-shadow: 0 2px 12px rgba(148, 217, 223, 0.3);
                }

                .toggle-card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }

                .toggle-checkbox {
                    width: 24px;
                    height: 24px;
                    border: 2px solid #ddd;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s;
                    flex-shrink: 0;
                }

                .toggle-card.active .toggle-checkbox {
                    background: ${BRAND_COLOR};
                    border-color: ${BRAND_COLOR};
                }

                .toggle-card-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #333;
                }

                .toggle-card-desc {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.4;
                }

                .result-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .result-card {
                    background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_DARK} 100%);
                    border-radius: 16px;
                    padding: 24px;
                    color: white;
                    text-align: center;
                }

                .result-label {
                    font-size: 14px;
                    opacity: 0.9;
                    margin-bottom: 8px;
                    font-weight: 500;
                }

                .result-value {
                    font-size: 36px;
                    font-weight: 800;
                    line-height: 1;
                }

                .result-unit {
                    font-size: 14px;
                    opacity: 0.85;
                    margin-top: 4px;
                }

                .model-selector {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                    margin-top: 16px;
                }

                .model-card {
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: white;
                    text-align: center;
                }

                .model-card:hover {
                    border-color: ${BRAND_COLOR};
                    box-shadow: 0 2px 8px rgba(148, 217, 223, 0.2);
                }

                .model-card.active {
                    border-color: ${BRAND_COLOR};
                    background: linear-gradient(135deg, ${BRAND_COLOR}15 0%, ${BRAND_DARK}15 100%);
                    box-shadow: 0 4px 12px rgba(148, 217, 223, 0.3);
                }

                .model-icon {
                    font-size: 32px;
                    margin-bottom: 12px;
                }

                .model-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 6px;
                }

                .model-desc {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.4;
                    margin-bottom: 8px;
                }

                .model-duration {
                    font-size: 12px;
                    color: ${BRAND_DARK};
                    font-weight: 600;
                }

                .warning-banner {
                    background: #fff4e6;
                    border: 2px solid #ffa500;
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .warning-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .warning-text {
                    font-size: 14px;
                    color: #666;
                    line-height: 1.5;
                }

                .cta-button {
                    width: 100%;
                    padding: 18px 24px;
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

                .cta-button:hover {
                    background: ${BRAND_DARK};
                    box-shadow: 0 6px 16px rgba(148, 217, 223, 0.4);
                    transform: translateY(-2px);
                }

                .cta-button:active {
                    transform: translateY(0);
                }

                @media (max-width: 640px) {
                    .planer-title {
                        font-size: 26px;
                    }

                    .planer-section {
                        padding: 20px;
                    }

                    .result-value {
                        font-size: 30px;
                    }

                    .toggle-options,
                    .model-selector {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="planer-container">
                <div className="planer-header">
                    <h1 className="planer-title">Elterngeld Planer</h1>
                    <p className="planer-subtitle">
                        Berechnen Sie Ihr Elterngeld und planen Sie die optimale Aufteilung
                    </p>
                </div>

                {/* Einkommen Section */}
                <div className="planer-section">
                    <div className="section-title">
                        💰 Einkommen
                        <button
                            className="info-button"
                            onClick={() => setShowIncomeInfo(!showIncomeInfo)}
                            aria-label="Info zu Einkommen"
                        >
                            i
                        </button>
                    </div>

                    <div className="slider-wrapper">
                        <div className="slider-label">
                            <span className="slider-title">Ihr monatliches Nettoeinkommen</span>
                            <span className="slider-value">
                                {monthlyIncome.toLocaleString("de-DE")} €
                            </span>
                        </div>
                        <div className="slider-track">
                            <input
                                type="range"
                                min={0}
                                max={5000}
                                step={50}
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(parseInt(e.target.value))}
                                className="slider"
                                style={{
                                    background: `linear-gradient(to right, ${BRAND_COLOR} 0%, ${BRAND_COLOR} ${(monthlyIncome / 5000) * 100}%, #e0e0e0 ${(monthlyIncome / 5000) * 100}%, #e0e0e0 100%)`
                                }}
                            />
                        </div>
                        <div className="slider-range">
                            <span>0 €</span>
                            <span>5.000 €</span>
                        </div>
                    </div>

                    {hasPartner && (
                        <div className="slider-wrapper">
                            <div className="slider-label">
                                <span className="slider-title">Einkommen Partner:in</span>
                                <span className="slider-value">
                                    {partnerIncome.toLocaleString("de-DE")} €
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={5000}
                                step={50}
                                value={partnerIncome}
                                onChange={(e) => setPartnerIncome(parseInt(e.target.value))}
                                className="slider"
                                style={{
                                    background: `linear-gradient(to right, ${BRAND_COLOR} 0%, ${BRAND_COLOR} ${(partnerIncome / 5000) * 100}%, #e0e0e0 ${(partnerIncome / 5000) * 100}%, #e0e0e0 100%)`
                                }}
                            />
                            <div className="slider-range">
                                <span>0 €</span>
                                <span>5.000 €</span>
                            </div>
                        </div>
                    )}

                    {hasPartner && (
                        <div style={{
                            marginTop: "16px",
                            padding: "12px 16px",
                            background: "#f8f9fa",
                            borderRadius: "8px",
                            fontSize: "14px",
                            color: "#666"
                        }}>
                            <strong>Gemeinsames Einkommen (Jahr):</strong>{" "}
                            {(totalIncome * 12).toLocaleString("de-DE")} €
                            {isOverLimit && (
                                <span style={{ color: "#ff6b6b", marginLeft: "8px" }}>
                                    ⚠️ Über Einkommensgrenze (175.000 €)
                                </span>
                            )}
                        </div>
                    )}

                    {showIncomeInfo && (
                        <div className="info-box">
                            <div className="info-box-title">💡 Wie wird das Einkommen berechnet?</div>
                            <div className="info-box-text">
                                <strong>Bemessungszeitraum Angestellte:</strong> Die letzten 12 Monate vor der Geburt (bzw. vor dem Mutterschutz).
                            </div>
                            <div className="info-box-text">
                                <strong>Bemessungszeitraum Selbständige:</strong> Das letzte abgeschlossene Wirtschaftsjahr vor der Geburt.
                            </div>
                            <div className="info-box-text">
                                <strong>Änderung möglich bei:</strong> Elternzeit für älteres Kind, Bezug von Mutterschaftsgeld, Arbeitslosigkeit oder Krankheit im Bemessungszeitraum.
                            </div>
                            <div className="info-box-text">
                                <strong>Einkommensgrenze:</strong> Gemeinsames zu versteuerndes Einkommen maximal 175.000 € (300.000 € ab 2025).
                            </div>
                        </div>
                    )}
                </div>

                {/* Zusatzoptionen */}
                <div className="planer-section">
                    <div className="section-title">⚙️ Ihre Situation</div>

                    <div className="toggle-options">
                        <div
                            className={`toggle-card ${hasPartner ? "active" : ""}`}
                            onClick={() => setHasPartner(!hasPartner)}
                        >
                            <div className="toggle-card-header">
                                <div className="toggle-checkbox">
                                    {hasPartner && <span style={{ color: "white", fontSize: "16px" }}>✓</span>}
                                </div>
                                <div className="toggle-card-title">Partner:in</div>
                            </div>
                            <div className="toggle-card-desc">
                                Ich beziehe Elterngeld gemeinsam mit meinem/meiner Partner:in
                            </div>
                        </div>

                        <div
                            className={`toggle-card ${hasSibling ? "active" : ""}`}
                            onClick={() => setHasSibling(!hasSibling)}
                        >
                            <div className="toggle-card-header">
                                <div className="toggle-checkbox">
                                    {hasSibling && <span style={{ color: "white", fontSize: "16px" }}>✓</span>}
                                </div>
                                <div className="toggle-card-title">Geschwisterbonus</div>
                            </div>
                            <div className="toggle-card-desc">
                                Mindestens ein Kind unter 3 Jahren oder zwei Kinder unter 6 Jahren
                            </div>
                        </div>

                        <div
                            className={`toggle-card ${hasMultiples ? "active" : ""}`}
                            onClick={() => setHasMultiples(!hasMultiples)}
                        >
                            <div className="toggle-card-header">
                                <div className="toggle-checkbox">
                                    {hasMultiples && <span style={{ color: "white", fontSize: "16px" }}>✓</span>}
                                </div>
                                <div className="toggle-card-title">Mehrlingszuschlag</div>
                            </div>
                            <div className="toggle-card-desc">
                                Zwillinge, Drillinge oder mehr
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live-Ergebnis */}
                <div className="planer-section">
                    <div className="section-title">📊 Ihr Ergebnis</div>

                    <div className="result-cards">
                        <div className="result-card">
                            <div className="result-label">Elterngeld pro Monat</div>
                            <div className="result-value">{elterngeldAmount.toLocaleString("de-DE")} €</div>
                            <div className="result-unit">monatlich</div>
                        </div>

                        <div className="result-card">
                            <div className="result-label">Bezugsdauer</div>
                            <div className="result-value">{duration.total}</div>
                            <div className="result-unit">Monate{hasPartner && " (beide)"}</div>
                        </div>

                        <div className="result-card">
                            <div className="result-label">Gesamt</div>
                            <div className="result-value">
                                {(elterngeldAmount * duration.total).toLocaleString("de-DE")} €
                            </div>
                            <div className="result-unit">insgesamt</div>
                        </div>
                    </div>

                    {(hasSibling || hasMultiples) && (
                        <div style={{
                            background: "#e8f5e9",
                            border: "2px solid #4caf50",
                            borderRadius: "12px",
                            padding: "16px",
                            marginTop: "16px"
                        }}>
                            <div style={{ fontSize: "14px", color: "#2e7d32", fontWeight: 600, marginBottom: "4px" }}>
                                ✨ Ihre Boni sind eingerechnet:
                            </div>
                            <div style={{ fontSize: "13px", color: "#666" }}>
                                {hasSibling && "• Geschwisterbonus: +10% (mind. 75€)"}
                                {hasSibling && hasMultiples && <br />}
                                {hasMultiples && "• Mehrlingszuschlag: +300€"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Modell-Planer */}
                <div className="planer-section">
                    <div className="section-title">
                        🎯 Modell-Planer
                        <button
                            className="info-button"
                            onClick={() => setShowModelInfo(!showModelInfo)}
                            aria-label="Info zu Modellen"
                        >
                            i
                        </button>
                    </div>

                    {showModelInfo && (
                        <div className="info-box">
                            <div className="info-box-title">📚 Die verschiedenen Modelle erklärt</div>
                            <div className="info-box-text">
                                <strong>Basis-Elterngeld:</strong> 12 Monate + 2 Partnermonate. Sie erhalten 65-67% Ihres Nettoeinkommens. Ideal für klassische Elternzeit.
                            </div>
                            <div className="info-box-text">
                                <strong>ElterngeldPlus:</strong> Doppelt so lange (bis zu 28 Monate), dafür die Hälfte des Betrags. Perfekt bei Teilzeitarbeit während der Elternzeit.
                            </div>
                            <div className="info-box-text">
                                <strong>Mix-Modell:</strong> Kombination aus Basis und Plus. 6 Monate Basis + 14 Monate Plus = 20 Monate Gesamtbezug. Maximale Flexibilität.
                            </div>
                        </div>
                    )}

                    <div className="model-selector">
                        <div
                            className={`model-card ${selectedModel === "basis" ? "active" : ""}`}
                            onClick={() => setSelectedModel("basis")}
                        >
                            <div className="model-icon">⚡</div>
                            <div className="model-title">Basis-Elterngeld</div>
                            <div className="model-desc">
                                Klassisches Modell für volle Elternzeit
                            </div>
                            <div className="model-duration">12 + 2 Partnermonate = 14 Monate</div>
                        </div>

                        <div
                            className={`model-card ${selectedModel === "plus" ? "active" : ""}`}
                            onClick={() => setSelectedModel("plus")}
                        >
                            <div className="model-icon">📈</div>
                            <div className="model-title">ElterngeldPlus</div>
                            <div className="model-desc">
                                Länger beziehen mit Teilzeitarbeit
                            </div>
                            <div className="model-duration">Bis zu 28 Monate</div>
                        </div>

                        <div
                            className={`model-card ${selectedModel === "mix" ? "active" : ""}`}
                            onClick={() => setSelectedModel("mix")}
                        >
                            <div className="model-icon">🎨</div>
                            <div className="model-title">Mix-Modell</div>
                            <div className="model-desc">
                                Beste Kombination aus beiden Welten
                            </div>
                            <div className="model-duration">6 Basis + 14 Plus = 20 Monate</div>
                        </div>
                    </div>
                </div>

                {isOverLimit && (
                    <div className="warning-banner">
                        <div className="warning-icon">⚠️</div>
                        <div className="warning-text">
                            <strong>Achtung:</strong> Ihr gemeinsames Jahreseinkommen liegt über der Einkommensgrenze von 175.000 €.
                            In diesem Fall besteht möglicherweise kein Anspruch auf Elterngeld. Ab 2025 gilt eine neue Grenze von 300.000 €.
                        </div>
                    </div>
                )}

                <button className="cta-button">
                    Jetzt Elterngeld beantragen →
                </button>
            </div>
        </div>
    )
}
