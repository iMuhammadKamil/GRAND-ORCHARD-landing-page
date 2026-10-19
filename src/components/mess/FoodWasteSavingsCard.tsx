import { Leaf, DollarSign, TrendingDown } from "lucide-react";

interface FoodWasteSavingsCardProps {
  totalPortionsSaved: number;
  totalRebateCredited: number;
  estimatedIngredientCostSaved: number;
}

export function FoodWasteSavingsCard({
  totalPortionsSaved,
  totalRebateCredited,
  estimatedIngredientCostSaved,
}: FoodWasteSavingsCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-card border border-emerald-800/50 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-emerald-500/20 text-emerald-300">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-white">
              Food Waste Prevention Impact
            </h3>
            <p className="text-[12px] text-emerald-200">
              Kitchen savings achieved through advance opt-outs
            </p>
          </div>
        </div>
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.08em] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
          Eco Initiative
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-emerald-800">
        <div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300 block">
            Portions Saved
          </span>
          <p className="font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none text-white mt-1.5">
            {totalPortionsSaved}
          </p>
          <span className="text-[12px] text-emerald-200/90">Meals un-wasted</span>
        </div>

        <div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300 block">
            Kitchen Savings
          </span>
          <p className="font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none text-emerald-300 mt-1.5">
            ${estimatedIngredientCostSaved.toFixed(2)}
          </p>
          <span className="text-[12px] text-emerald-200/90">Raw ingredients</span>
        </div>

        <div>
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300 block">
            Resident Credits
          </span>
          <p className="font-mono font-medium tracking-[-0.02em] tabular-nums text-[26px] leading-none text-teal-200 mt-1.5">
            ${totalRebateCredited.toFixed(2)}
          </p>
          <span className="text-[12px] text-emerald-200/90">Rebates earned</span>
        </div>
      </div>
    </div>
  );
}

