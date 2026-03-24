import { MatchingWizard } from "@/components/matching/matching-wizard";

export default function MatchPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Find the Right Lawyer for You</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Answer a few simple questions and we'll match you with the best legal professionals for your specific needs.
                    </p>
                </div>

                <MatchingWizard />
            </div>
        </div>
    );
}
