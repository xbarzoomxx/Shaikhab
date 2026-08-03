import Navbar from "@/components/Navbar";
import BylawsContent from "@/components/BylawsContent";

export const metadata = {
  title: "لائحة الصندوق العلاجي — أسرة الشيخاب",
};

export default function BylawsPage() {
  return (
    <main className="min-h-screen">
      <Navbar active="/takaful" />
      <section className="max-w-3xl mx-auto px-6 py-8">
        <BylawsContent />
      </section>
      <footer className="text-center text-xs text-ink/40 py-8">
        بوابة أسرة الشيخاب — دليل التوثيق العائلي
      </footer>
    </main>
  );
}
