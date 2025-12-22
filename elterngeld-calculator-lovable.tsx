import { useState, useMemo, useEffect } from "react";
import { addPropertyControls, ControlType } from "framer";

// ============================================================================
// TYPES
// ============================================================================

interface CalculatorState {
  monthlyIncome: number;
  hasSiblingBonus: boolean;
  multipleChildren: number;
}

interface MonthSelection {
  youBasis: boolean;
  youPlus: boolean;
  partnerBasis: boolean;
  partnerPlus: boolean;
}

interface PlannerState {
  birthDate: Date | null;
  isSingleParent: boolean;
  months: MonthSelection[];
  visibleMonths: number;
}

interface ValidationError {
  message: string;
  type: "error" | "warning";
}

interface ElterngeldCalculation {
  basisAmount: number;
  plusAmount: number;
  siblingBonus: number;
  multipleBonus: number;
  totalBasis: number;
  totalPlus: number;
  isMaxReached: boolean;
  isEligible: boolean;
}

// ============================================================================
// CALCULATION LOGIC
// ============================================================================

const MIN_ELTERNGELD = 300;
const MAX_ELTERNGELD = 1800;
const INCOME_PERCENTAGE = 0.65;
const ANNUAL_INCOME_LIMIT = 175000;
const MAX_INCOME_FOR_CALC = 2770;

function calculateElterngeld(state: CalculatorState): ElterngeldCalculation {
  const annualIncome = state.monthlyIncome * 12;
  const isEligible = annualIncome <= ANNUAL_INCOME_LIMIT;

  if (!isEligible) {
    return {
      basisAmount: 0,
      plusAmount: 0,
      siblingBonus: 0,
      multipleBonus: 0,
      totalBasis: 0,
      totalPlus: 0,
      isMaxReached: false,
      isEligible: false,
    };
  }

  let basisAmount = Math.round(state.monthlyIncome * INCOME_PERCENTAGE);
  basisAmount = Math.max(MIN_ELTERNGELD, Math.min(MAX_ELTERNGELD, basisAmount));
  const isMaxReached = state.monthlyIncome >= MAX_INCOME_FOR_CALC;
  const plusAmount = Math.round(basisAmount / 2);

  let siblingBonus = 0;
  if (state.hasSiblingBonus) {
    const tenPercent = Math.round(basisAmount * 0.1);
    siblingBonus = Math.max(tenPercent, 75);
  }

  const multipleBonus = state.multipleChildren * 300;
  const totalBasis = basisAmount + siblingBonus + multipleBonus;
  const totalPlus = plusAmount + Math.round(siblingBonus / 2) + Math.round(multipleBonus / 2);

  return {
    basisAmount,
    plusAmount,
    siblingBonus,
    multipleBonus,
    totalBasis,
    totalPlus,
    isMaxReached,
    isEligible,
  };
}

function validateMonthPlan(months: MonthSelection[], isSingleParent: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  const youBasisMonths = months.filter((m) => m.youBasis).length;
  const partnerBasisMonths = months.filter((m) => m.partnerBasis).length;
  const totalBasisMonths = youBasisMonths + partnerBasisMonths;

  const simultaneousBasisMonths = months.filter(
    (m, index) => m.youBasis && m.partnerBasis && index < 12
  ).length;

  const simultaneousBasisAfter12 = months.filter(
    (m, index) => m.youBasis && m.partnerBasis && index >= 12
  ).length;

  if (isSingleParent) {
    if (youBasisMonths > 14) {
      errors.push({
        message: "Maximum 14 Basiselterngeld months allowed for single parents.",
        type: "error",
      });
    }

    if (youBasisMonths > 0 && youBasisMonths < 2) {
      errors.push({
        message: "Minimum 2 Basiselterngeld months required if taking any.",
        type: "error",
      });
    }
  } else {
    if (totalBasisMonths > 14) {
      errors.push({
        message: `Maximum 14 Basiselterngeld months allowed combined. Currently: ${totalBasisMonths} months.`,
        type: "error",
      });
    }

    if (totalBasisMonths === 14) {
      if (youBasisMonths < 2) {
        errors.push({
          message: "If taking 14 months total, you must take at least 2 Basiselterngeld months.",
          type: "error",
        });
      }
      if (partnerBasisMonths < 2) {
        errors.push({
          message: "If taking 14 months total, partner must take at least 2 Basiselterngeld months.",
          type: "error",
        });
      }
    }

    if (simultaneousBasisMonths > 1) {
      errors.push({
        message: `Maximum 1 month of simultaneous Basiselterngeld allowed. Currently: ${simultaneousBasisMonths} months.`,
        type: "error",
      });
    }

    if (simultaneousBasisAfter12 > 0) {
      errors.push({
        message: "Simultaneous Basiselterngeld is only allowed in the first 12 months.",
        type: "error",
      });
    }
  }

  return errors;
}

function getMonthDateRange(birthDate: Date, monthIndex: number): { start: Date; end: Date } {
  const start = new Date(birthDate);
  start.setMonth(start.getMonth() + monthIndex);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);

  return { start, end };
}

function formatDateRange(start: Date, end: Date): string {
  const startDay = start.getDate().toString().padStart(2, "0");
  const startMonth = (start.getMonth() + 1).toString().padStart(2, "0");
  const startYear = start.getFullYear().toString().slice(-2);

  const endDay = end.getDate().toString().padStart(2, "0");
  const endMonth = (end.getMonth() + 1).toString().padStart(2, "0");
  const endYear = end.getFullYear().toString().slice(-2);

  return `${startDay}. ${startMonth}. ${startYear} –\n${endDay}. ${endMonth}. ${endYear}`;
}

function calculateMonthAmount(month: MonthSelection, calculation: ElterngeldCalculation): number {
  let total = 0;

  if (month.youBasis) total += calculation.totalBasis;
  if (month.youPlus) total += calculation.totalPlus;
  if (month.partnerBasis) total += calculation.totalBasis;
  if (month.partnerPlus) total += calculation.totalPlus;

  return total;
}

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const SPACING = {
  "2xs": "4px",
  xs: "6px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "40px",
};

const COLORS = {
  background: "#FAFAFA",
  card: "#FFFFFF",
  cardBeige: "#EFEBDE",
  border: "#E5E5E5",
  foreground: "#000000",
  muted: "#737373",
  primary: "#000000",
  destructive: "#EF4444",
};

// ============================================================================
// INLINE COMPONENTS
// ============================================================================

const Checkbox = ({ checked, onChange, id }: any) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      width: "14px",
      height: "14px",
      border: `1px solid ${checked ? COLORS.primary : COLORS.border}`,
      backgroundColor: checked ? COLORS.primary : COLORS.card,
      borderRadius: "3px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    }}
  >
    {checked && (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M8 2L3.5 7L2 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
);

const Label = ({ children, htmlFor, style }: any) => (
  <label htmlFor={htmlFor} style={{ cursor: "pointer", userSelect: "none", ...style }}>
    {children}
  </label>
);

const Button = ({ children, onClick, variant = "default", disabled, style }: any) => {
  const variants: any = {
    default: {
      background: COLORS.primary,
      color: "#FFFFFF",
    },
    outline: {
      background: "transparent",
      color: COLORS.foreground,
      border: `1px solid ${COLORS.border}`,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: `${SPACING.sm} ${SPACING.md}`,
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: SPACING.sm,
        opacity: disabled ? 0.5 : 1,
        transition: "opacity 0.2s",
        border: "none",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
};

const Slider = ({ value, onChange, min, max, step }: any) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "3px",
          background: `linear-gradient(to right, ${COLORS.primary} 0%, ${COLORS.primary} ${percentage}%, ${COLORS.border} ${percentage}%, ${COLORS.border} 100%)`,
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
        }}
      />
      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${COLORS.primary};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${COLORS.primary};
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

const Select = ({ value, onChange, children }: any) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{
      width: "100%",
      padding: `${SPACING.xs} ${SPACING.sm}`,
      fontSize: "12px",
      border: `1px solid ${COLORS.border}`,
      borderRadius: "6px",
      backgroundColor: COLORS.card,
      cursor: "pointer",
      outline: "none",
    }}
  >
    {children}
  </select>
);

// ============================================================================
// STEP INDICATOR
// ============================================================================

const StepIndicator = ({ currentStep, totalSteps, labels }: any) => (
  <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div key={i} style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: i + 1 <= currentStep ? COLORS.primary : "transparent",
              border: `2px solid ${i + 1 <= currentStep ? COLORS.primary : COLORS.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
              color: i + 1 <= currentStep ? "#FFFFFF" : COLORS.muted,
            }}
          >
            {i + 1}
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: i + 1 === currentStep ? 600 : 400,
              color: i + 1 <= currentStep ? COLORS.foreground : COLORS.muted,
            }}
          >
            {labels[i]}
          </span>
        </div>
        {i < totalSteps - 1 && (
          <div
            style={{
              width: "32px",
              height: "2px",
              background: i + 1 < currentStep ? COLORS.primary : COLORS.border,
            }}
          />
        )}
      </div>
    ))}
  </div>
);

// ============================================================================
// INCOME SLIDER COMPONENT
// ============================================================================

const IncomeSlider = ({ value, onChange, hasSiblingBonus, onSiblingBonusChange, multipleChildren, onMultipleChildrenChange }: any) => {
  const handleInputChange = (e: any) => {
    const numericValue = parseInt(e.target.value.replace(/\D/g, "")) || 0;
    const clampedValue = Math.min(7000, Math.max(0, numericValue));
    onChange(clampedValue);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md, height: "100%" }}>
      <div style={{ padding: SPACING.md, borderRadius: "12px", background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between" }}>
          <div style={{ maxWidth: "70%" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: 0 }}>
              Monthly net income
            </h2>
            <p style={{ fontSize: "12px", color: COLORS.muted, margin: `${SPACING["2xs"]} 0 0 0` }}>
              Average of the 12 months before birth.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: COLORS.foreground }}>€</span>
            <input
              type="text"
              value={value.toLocaleString("de-DE")}
              onChange={handleInputChange}
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: COLORS.foreground,
                background: "transparent",
                textAlign: "right",
                width: "80px",
                outline: "none",
                border: "1px solid transparent",
                borderRadius: "4px",
                padding: "2px 4px",
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: SPACING.xl }}>
          <Slider value={value} onChange={onChange} min={0} max={7000} step={50} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: COLORS.muted, marginTop: SPACING["2xs"] }}>
            <span>€0</span>
            <span>€7,000</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.sm }}>
        <div style={{ padding: SPACING.md, borderRadius: "12px", background: COLORS.card, border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: `0 0 ${SPACING.sm} 0` }}>
            Do you already have children?
          </h3>
          <p style={{ fontSize: "11px", color: COLORS.muted, margin: `0 0 ${SPACING.xl} 0`, lineHeight: 1.4, flex: 1 }}>
            10% extra Elterngeld (min. €75/month) if a sibling is under 3, or two siblings are under 6.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm, height: "32px" }}>
            <Checkbox checked={hasSiblingBonus} onChange={onSiblingBonusChange} id="siblingBonus" />
            <Label htmlFor="siblingBonus" style={{ fontSize: "12px", lineHeight: 1 }}>
              Yes, add sibling bonus
            </Label>
          </div>
        </div>

        <div style={{ padding: SPACING.md, borderRadius: "12px", background: COLORS.card, border: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: `0 0 ${SPACING.sm} 0` }}>
            More than one child at birth?
          </h3>
          <p style={{ fontSize: "11px", color: COLORS.muted, margin: `0 0 ${SPACING.xl} 0`, lineHeight: 1.4, flex: 1 }}>
            €300 per additional child per month.
          </p>
          <Select value={multipleChildren.toString()} onChange={(v: string) => onMultipleChildrenChange(parseInt(v))}>
            <option value="0">Single child</option>
            <option value="1">Twins</option>
            <option value="2">Triplets</option>
            <option value="3">3+</option>
          </Select>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// RESULT CARD COMPONENT
// ============================================================================

const ResultCard = ({ calculation }: { calculation: ElterngeldCalculation }) => {
  if (!calculation.isEligible) {
    return (
      <div style={{ padding: SPACING.md, borderRadius: "12px", border: `1px solid ${COLORS.border}`, height: "100%", display: "flex", flexDirection: "column", background: COLORS.cardBeige }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: `0 0 ${SPACING.sm} 0` }}>
          Not Eligible
        </h3>
        <p style={{ fontSize: "12px", color: COLORS.muted, margin: 0 }}>
          Annual income exceeds €175,000 limit.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: SPACING.md, borderRadius: "12px", border: `1px solid ${COLORS.border}`, height: "100%", display: "flex", flexDirection: "column", background: COLORS.cardBeige }}>
      <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: `0 0 ${SPACING.md} 0` }}>
        Your Elterngeld
      </h3>

      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: SPACING.md }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SPACING.xs }}>
            <span style={{ fontSize: "12px", color: COLORS.muted }}>Basiselterngeld</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: COLORS.foreground }}>
              €{calculation.totalBasis.toLocaleString("de-DE")}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: COLORS.muted }}>12–14 months</div>
        </div>

        <div style={{ marginBottom: SPACING.md }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: SPACING.xs }}>
            <span style={{ fontSize: "12px", color: COLORS.muted }}>ElterngeldPlus</span>
            <span style={{ fontSize: "20px", fontWeight: 700, color: COLORS.foreground }}>
              €{calculation.totalPlus.toLocaleString("de-DE")}
            </span>
          </div>
          <div style={{ fontSize: "11px", color: COLORS.muted }}>24–28 months</div>
        </div>

        {(calculation.siblingBonus > 0 || calculation.multipleBonus > 0) && (
          <div style={{ paddingTop: SPACING.sm, borderTop: `1px solid ${COLORS.border}` }}>
            {calculation.siblingBonus > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: SPACING.xs }}>
                <span style={{ color: COLORS.muted }}>Sibling bonus</span>
                <span style={{ fontWeight: 600, color: COLORS.foreground }}>+€{calculation.siblingBonus}</span>
              </div>
            )}
            {calculation.multipleBonus > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: COLORS.muted }}>Multiple birth bonus</span>
                <span style={{ fontWeight: 600, color: COLORS.foreground }}>+€{calculation.multipleBonus}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MONTH BOX COMPONENT
// ============================================================================

const MonthBox = ({ monthIndex, birthDate, selection, calculation, isSingleParent, onChange, hasError }: any) => {
  const { start, end } = getMonthDateRange(birthDate, monthIndex);
  const dateRange = formatDateRange(start, end);
  const monthAmount = calculateMonthAmount(selection, calculation);
  const hasAnySelection = selection.youBasis || selection.youPlus || selection.partnerBasis || selection.partnerPlus;

  const handleChange = (field: keyof MonthSelection, value: boolean) => {
    const newSelection = { ...selection, [field]: value };

    if (field === "youBasis" && value) {
      newSelection.youPlus = false;
    } else if (field === "youPlus" && value) {
      newSelection.youBasis = false;
    } else if (field === "partnerBasis" && value) {
      newSelection.partnerPlus = false;
    } else if (field === "partnerPlus" && value) {
      newSelection.partnerBasis = false;
    }

    onChange(newSelection);
  };

  return (
    <div
      style={{
        flexShrink: 0,
        width: "96px",
        padding: SPACING.sm,
        borderRadius: "12px",
        background: COLORS.card,
        border: `1px solid ${hasError ? COLORS.destructive : hasAnySelection ? COLORS.primary : COLORS.border}`,
        boxShadow: hasError ? `0 0 0 2px ${COLORS.destructive}20` : hasAnySelection ? `0 0 0 2px ${COLORS.primary}10` : "none",
        transition: "all 0.2s",
      }}
    >
      <div style={{ marginBottom: SPACING.md }}>
        <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: 0 }}>
          Month {monthIndex + 1}
        </h3>
        <p style={{ fontSize: "10px", color: COLORS.muted, whiteSpace: "pre-line", lineHeight: 1.4, marginTop: "4px" }}>
          {dateRange}
        </p>
      </div>

      <div style={{ marginBottom: SPACING.md }}>
        <span style={{ fontSize: "11px", fontWeight: 500, color: COLORS.foreground, display: "block", marginBottom: SPACING.sm }}>
          You
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
          <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
            <Checkbox checked={selection.youBasis} onChange={(v: boolean) => handleChange("youBasis", v)} id={`you-basis-${monthIndex}`} />
            <Label htmlFor={`you-basis-${monthIndex}`} style={{ fontSize: "11px", color: COLORS.muted }}>
              Basis
            </Label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
            <Checkbox checked={selection.youPlus} onChange={(v: boolean) => handleChange("youPlus", v)} id={`you-plus-${monthIndex}`} />
            <Label htmlFor={`you-plus-${monthIndex}`} style={{ fontSize: "11px", color: COLORS.muted }}>
              Plus
            </Label>
          </div>
        </div>
      </div>

      {!isSingleParent && (
        <div style={{ marginBottom: SPACING.md }}>
          <span style={{ fontSize: "11px", fontWeight: 500, color: COLORS.foreground, display: "block", marginBottom: SPACING.sm }}>
            Partner
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: SPACING.sm }}>
            <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
              <Checkbox checked={selection.partnerBasis} onChange={(v: boolean) => handleChange("partnerBasis", v)} id={`partner-basis-${monthIndex}`} />
              <Label htmlFor={`partner-basis-${monthIndex}`} style={{ fontSize: "11px", color: COLORS.muted }}>
                Basis
              </Label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
              <Checkbox checked={selection.partnerPlus} onChange={(v: boolean) => handleChange("partnerPlus", v)} id={`partner-plus-${monthIndex}`} />
              <Label htmlFor={`partner-plus-${monthIndex}`} style={{ fontSize: "11px", color: COLORS.muted }}>
                Plus
              </Label>
            </div>
          </div>
        </div>
      )}

      <div style={{ paddingTop: SPACING.sm, borderTop: `1px solid ${COLORS.border}` }}>
        {hasAnySelection ? (
          <span style={{ fontSize: "14px", fontWeight: 700, color: COLORS.primary }}>
            €{monthAmount.toLocaleString("de-DE")}
          </span>
        ) : (
          <span style={{ fontSize: "14px", color: COLORS.muted }}>Sum</span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MONTH PLANNER COMPONENT
// ============================================================================

const MonthPlanner = ({ calculation }: { calculation: ElterngeldCalculation }) => {
  const [plannerState, setPlannerState] = useState<PlannerState>({
    birthDate: null,
    isSingleParent: false,
    months: Array.from({ length: 36 }, () => ({
      youBasis: false,
      youPlus: false,
      partnerBasis: false,
      partnerPlus: false,
    })),
    visibleMonths: 14,
  });

  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const scrollRef = useState<HTMLDivElement | null>(null);

  const errors = useMemo(
    () => validateMonthPlan(plannerState.months, plannerState.isSingleParent),
    [plannerState.months, plannerState.isSingleParent]
  );

  const handleMonthChange = (index: number, selection: MonthSelection) => {
    setPlannerState((prev) => ({
      ...prev,
      months: prev.months.map((m, i) => (i === index ? selection : m)),
    }));
  };

  const handleScroll = () => {
    if (scrollRef[0]) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef[0];
      setShowLeftIndicator(scrollLeft > 10);
      setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [plannerState.visibleMonths]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: SPACING.md, height: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACING.sm }}>
        <div style={{ padding: SPACING.md, borderRadius: "12px", background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: `0 0 ${SPACING.sm} 0` }}>
            Birth Date
          </h3>
          <input
            type="date"
            value={plannerState.birthDate ? plannerState.birthDate.toISOString().split("T")[0] : ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setPlannerState((prev) => ({ ...prev, birthDate: date }));
            }}
            style={{
              width: "100%",
              padding: SPACING.sm,
              fontSize: "12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "6px",
              outline: "none",
            }}
          />
        </div>

        <div style={{ padding: SPACING.md, borderRadius: "12px", background: COLORS.card, border: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: COLORS.foreground, margin: `0 0 ${SPACING.sm} 0` }}>
            Family Status
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm, height: "32px" }}>
            <Checkbox
              checked={plannerState.isSingleParent}
              onChange={(v: boolean) => setPlannerState((prev) => ({ ...prev, isSingleParent: v }))}
              id="singleParent"
            />
            <Label htmlFor="singleParent" style={{ fontSize: "12px" }}>
              Single parent
            </Label>
          </div>
        </div>
      </div>

      <div style={{ minHeight: "28px" }}>
        {errors.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: SPACING.sm }}>
            {errors.map((error, index) => (
              <div
                key={index}
                style={{
                  padding: `${SPACING.xs} ${SPACING.sm}`,
                  borderRadius: "6px",
                  background: `${COLORS.destructive}10`,
                  border: `1px solid ${COLORS.destructive}`,
                  fontSize: "11px",
                  color: COLORS.destructive,
                }}
              >
                {error.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {plannerState.birthDate && (
        <div style={{ position: "relative" }}>
          {showLeftIndicator && (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "40px",
                background: `linear-gradient(to right, ${COLORS.background}, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: "20px" }}>←</div>
            </div>
          )}

          <div
            ref={(el) => {
              scrollRef[0] = el;
              if (el) {
                el.addEventListener("scroll", handleScroll);
              }
            }}
            style={{
              display: "flex",
              gap: SPACING.sm,
              overflowX: "auto",
              paddingBottom: SPACING.sm,
              scrollBehavior: "smooth",
            }}
          >
            {plannerState.months.slice(0, plannerState.visibleMonths).map((month, index) => (
              <MonthBox
                key={index}
                monthIndex={index}
                birthDate={plannerState.birthDate!}
                selection={month}
                calculation={calculation}
                isSingleParent={plannerState.isSingleParent}
                onChange={(selection: MonthSelection) => handleMonthChange(index, selection)}
                hasError={false}
              />
            ))}
          </div>

          {showRightIndicator && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                bottom: 0,
                width: "40px",
                background: `linear-gradient(to left, ${COLORS.background}, transparent)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <div style={{ fontSize: "20px" }}>→</div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm }}>
        <span style={{ fontSize: "12px", color: COLORS.muted }}>Show months:</span>
        <Select
          value={plannerState.visibleMonths.toString()}
          onChange={(v: string) => setPlannerState((prev) => ({ ...prev, visibleMonths: parseInt(v) }))}
        >
          <option value="14">14 months</option>
          <option value="24">24 months</option>
          <option value="36">36 months</option>
        </Select>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ElterngeldCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    monthlyIncome: 2500,
    hasSiblingBonus: false,
    multipleChildren: 0,
  });

  const calculation = useMemo(() => {
    return calculateElterngeld(calculatorState);
  }, [calculatorState]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #FAFAFA, #F5F5F5)", padding: `${SPACING.xl} ${SPACING.md}` }}>
      <main style={{ maxWidth: "1024px", margin: "0 auto" }}>
        <div style={{ background: COLORS.card, borderRadius: "16px", border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <div style={{ padding: `${SPACING.md} ${SPACING.lg}`, borderBottom: `1px solid ${COLORS.border}`, background: "#FAFAFA" }}>
            <StepIndicator currentStep={currentStep} totalSteps={2} labels={["Calculate Elterngeld", "Plan Elterngeld"]} />
          </div>

          <div style={{ padding: SPACING.lg }}>
            <div style={{ display: "grid", gridTemplateRows: "1fr", overflow: "hidden" }}>
              <div
                style={{
                  gridColumnStart: 1,
                  gridRowStart: 1,
                  width: "100%",
                  minWidth: 0,
                  visibility: currentStep === 1 ? "visible" : "hidden",
                  opacity: currentStep === 1 ? 1 : 0,
                  transition: "opacity 0.3s",
                }}
              >
                <div style={{ display: "grid", gap: SPACING.md, gridTemplateColumns: "1fr 35%", alignItems: "stretch" }}>
                  <IncomeSlider
                    value={calculatorState.monthlyIncome}
                    onChange={(value: number) => setCalculatorState((prev) => ({ ...prev, monthlyIncome: value }))}
                    hasSiblingBonus={calculatorState.hasSiblingBonus}
                    onSiblingBonusChange={(value: boolean) => setCalculatorState((prev) => ({ ...prev, hasSiblingBonus: value }))}
                    multipleChildren={calculatorState.multipleChildren}
                    onMultipleChildrenChange={(value: number) => setCalculatorState((prev) => ({ ...prev, multipleChildren: value }))}
                  />
                  <ResultCard calculation={calculation} />
                </div>
              </div>

              <div
                style={{
                  gridColumnStart: 1,
                  gridRowStart: 1,
                  height: "100%",
                  width: "100%",
                  minWidth: 0,
                  visibility: currentStep === 2 ? "visible" : "hidden",
                  opacity: currentStep === 2 ? 1 : 0,
                  transition: "opacity 0.3s",
                }}
              >
                <MonthPlanner calculation={calculation} />
              </div>
            </div>
          </div>

          <div style={{ padding: `${SPACING.md} ${SPACING.lg}`, borderTop: `1px solid ${COLORS.border}`, background: "#FAFAFA", display: "flex", gap: SPACING.sm, justifyContent: "space-between" }}>
            {currentStep > 1 ? (
              <Button variant="outline" onClick={() => setCurrentStep((prev) => prev - 1)} style={{ width: "auto" }}>
                <span>←</span>
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {currentStep === 1 && calculation.isEligible && (
              <Button onClick={() => setCurrentStep((prev) => prev + 1)} style={{ width: "auto" }}>
                <span>Continue to Planning</span>
                <span>→</span>
              </Button>
            )}

            {currentStep === 2 && (
              <Button style={{ width: "auto" }}>
                <span>Start your application</span>
                <span>→</span>
              </Button>
            )}
          </div>
        </div>

        <p style={{ marginTop: SPACING.md, textAlign: "center", fontSize: "11px", color: COLORS.muted }}>
          This calculator provides estimates based on current Elterngeld regulations. For official calculations, please consult your local Elterngeldstelle.
        </p>
      </main>
    </div>
  );
}

addPropertyControls(ElterngeldCalculator, {});
