import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRoles } from "@/lib/constants";
import { getAvailableBedsForGender } from "@/app/actions/residents";
import { OnboardingWizard } from "@/components/residents/OnboardingWizard";
import { Navbar } from "@/components/Navbar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewResidentPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const canOnboard =
    user.role === UserRoles.SUPER_ADMIN || user.role === UserRoles.WARDEN;
  if (!canOnboard) redirect("/dashboard/residents");

  // Pre-fetch beds for MALE as default (wizard will handle both genders
  // but we pre-load all buildings; SmartBedPicker filters client-side by gender selection)
  const maleBuildings = await getAvailableBedsForGender("MALE");
  const femaleBuildings = await getAvailableBedsForGender("FEMALE");
  const coedBuildings = await getAvailableBedsForGender("COED");

  // Merge: buildings appear under their own gender query already
  // We pass a combined unique list and let SmartBedPicker filter by resident gender
  const allBuildingsRaw = [...maleBuildings, ...femaleBuildings, ...coedBuildings];
  const seen = new Set<string>();
  const allBuildings = allBuildingsRaw.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar user={user} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link
            href="/dashboard/residents"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500 hover:text-blue-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Residents Directory
          </Link>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
            New Resident Onboarding
          </h1>
          <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1.5">
            Complete all three steps to create a resident account and allocate a bed atomically.
          </p>
        </div>

        <OnboardingWizard availableBuildings={allBuildings} />
      </main>
    </div>
  );
}

