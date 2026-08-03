import { IntroQuote, Overview, Beneficiaries, FundingAndDisbursement, GeneralRules } from "@/components/BylawsSections";

export default function BylawsContent() {
  return (
    <>
      <div className="text-center mb-8">
        <p className="text-sm text-gold mb-1">الإصدار الأول — لعام 2026م</p>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="text-3xl md:text-4xl text-teal-dark"
        >
          لائحة الصندوق العلاجي
        </h2>
        <p className="text-ink/60 mt-1">جمعية الشيخاب الخيرية — معتمدة من الجمعية العمومية</p>
      </div>

      <IntroQuote />
      <Overview />
      <Beneficiaries />
      <FundingAndDisbursement />
      <GeneralRules />
    </>
  );
}
