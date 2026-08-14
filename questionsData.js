const practiceQuestions = [
  {
    id: "q1_ias16",
    course: "acca",
    chapter: "Chapter 7: IAS 16 Property, Plant and Equipment",
    text: "The non-current asset register shows a carrying amount for non-current assets of $85,600; the general ledger accounts include a cost balance of $185,000 and an accumulated depreciation balance of $55,000.<br><br>Which of the following statements may explain the discrepancy?",
    options: [
      "A. The omission of an addition of land costing $30,000 from the ledger account and the omission of the disposal of an asset from the register (cost $25,600 and accumulated depreciation at disposal $11,200).",
      "B. The omission of the revaluation of an asset upwards by $16,600 and the depreciation charge of $20,000 from the ledger account and the omission of the disposal of an asset with a carrying amount of $41,000 from the register.",
      "C. The omission of the disposal of an asset from the ledger accounts (cost $25,600 and accumulated depreciation at disposal $11,200) and the omission of an addition of land costing $30,000 from the register.",
      "D. The omission of an upwards revaluation by $16,400 from the register and the accidental debiting of the depreciation charge of $28,000 to the accumulated depreciation ledger account."
    ],
    correctAnswerIndex: 2,
    explanation: `<strong>Step-by-Step Explanation</strong><br><br>
1. Initial Discrepancy Calculation<br>
Asset Register Carrying Amount: $85,600<br>
General Ledger Carrying Amount: Cost ($185,000) - Accumulated Depreciation ($55,000) = $130,000<br>
Difference to reconcile: $130,000 - $85,600 = $44,400 (General ledger is higher than the register by $44,400).<br><br>

2. Evaluating Statement C<br>
<strong>Adjustment to General Ledger:</strong><br>
Carrying amount of disposed asset = Cost ($25,600) - Accumulated Depreciation ($11,200) = $14,400<br>
Removing the omitted disposal: $130,000 - $14,400 = <strong>$115,600</strong><br><br>

<strong>Adjustment to Asset Register:</strong><br>
Adding the omitted land addition: $85,600 + $30,000 = <strong>$115,600</strong><br><br>

Result: Both records reconcile to an adjusted carrying amount of $115,600.<br><br>
<strong>Correct Answer: C</strong>`
  },
  {
    id: "q2_ias16",
    course: "acca",
    chapter: "Chapter 7: IAS 16 Property, Plant and Equipment",
    text: "A business purchased a motor car on 1 July 20X3 for $20,000. It is to be depreciated at 20% per year on the straight line basis, assuming a residual value at the end of five years of $4,000, with a proportionate depreciation charge in the years of purchase and disposal.<br><br>The $20,000 cost was correctly entered in the bank general ledger account but posted to the debit of the motor vehicles repairs account.<br><br>How will the business profit for the year ended 31 December 20X3 be affected by the error?",
    options: [
      "A. Understated by $18,400",
      "B. Understated by $16,800",
      "C. Overstated by $18,400",
      "D. Overstated by $16,800"
    ],
    correctAnswerIndex: 0,
    explanation: `<strong>Step-by-Step Explanation</strong><br><br>
<strong>1. Incorrect Treatment Recorded</strong><br>
The business wrongly debited the full purchase price of $20,000 to the motor vehicle repairs account (an expense in profit or loss).<br>
No depreciation was recorded because the asset was not capitalized.<br>
Incorrect charge to P&L: $20,000<br><br>
<strong>2. Correct Treatment Required</strong><br>
The purchase of $20,000 should have been capitalized on the statement of financial position as a non-current asset.<br>
Depreciation should have been charged for 6 months (1 July 20X3 to 31 December 20X3):<br>
Depreciable amount = Cost - Residual value = $20,000 - $4,000 = $16,000<br>
Annual depreciation = $16,000 × 20% = $3,200<br>
6-month depreciation = $3,200 × (6/12) = $1,600<br>
Correct charge to P&L: $1,600<br><br>
<strong>3. Net Effect on Profit</strong><br>
Excess expenses charged to P&L = $20,000 - $1,600 = $18,400<br>
Because expenses were overstated by $18,400, profit for the year ended 31 December 20X3 is understated by $18,400.<br><br>
<strong>Correct Answer: A. Understated by $18,400</strong>`
  },
  {
    id: "q3_ias16",
    course: "acca",
    chapter: "Chapter 7: IAS 16 Property, Plant and Equipment",
    text: "Identify whether each of the following statements is true or false:<br><br><strong>1.</strong> IAS 16 Property, Plant and Equipment requires entities to disclose the purchase date of each asset.<br><strong>2.</strong> The carrying amount of a non-current asset is the cost or valuation of that asset less accumulated depreciation.<br><strong>3.</strong> IAS 16 Property, Plant and Equipment permits entities to make a transfer from the revaluation surplus to retained earnings for excess depreciation on revalued assets.<br><strong>4.</strong> Once decided, the useful life of a non-current asset should not be changed.",
    options: [
      "A. 1 False, 2 True, 3 True, 4 False",
      "B. 1 True, 2 False, 3 False, 4 True",
      "C. 1 True, 2 True, 3 False, 4 False",
      "D. 1 False, 2 False, 3 True, 4 True"
    ],
    correctAnswerIndex: 0,
    explanation: `<strong>Step-by-Step Explanation</strong><br><br><strong>Statement 1: FALSE.</strong> IAS 16 requires disclosures such as measurement bases, depreciation methods, useful lives, gross carrying amounts, and reconciliations of movements in carrying amounts, but it does not require disclosing the individual purchase date of each asset.<br><br><strong>Statement 2: TRUE.</strong> Carrying amount (book value) is defined under IAS 16 as the amount at which an asset is recognized after deducting any accumulated depreciation and accumulated impairment losses.<br><br><strong>Statement 3: TRUE.</strong> IAS 16 allows (but does not require) an annual transfer of excess depreciation (the difference between depreciation based on the revalued amount and depreciation based on historical cost) from the revaluation surplus directly to retained earnings within equity.<br><br><strong>Statement 4: FALSE.</strong> IAS 16 requires that the useful life and residual value of an asset be reviewed at least at each financial year-end. If expectations differ from previous estimates, the change is accounted for prospectively as a change in accounting estimate under IAS 8.`
  },
  {
    id: "q4_ias16",
    course: "acca",
    chapter: "Chapter 7: IAS 16 Property, Plant and Equipment",
    text: `The plant and equipment cost account in the records of C Co for the year ended 31 December 20X6 is as follows:<br><br><table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1px solid #ddd;"><thead><tr><th colspan="2" style="border: 1px solid #ddd; padding: 8px; text-align: center; background: #f8f9fa;">Plant and equipment – cost</th></tr></thead><tbody><tr><td style="border: 1px solid #ddd; padding: 8px; width: 50%;"><div style="display: flex; justify-content: space-between;"><span>Balance b/f</span> <span>$960,000</span></div><div style="display: flex; justify-content: space-between;"><span>1 July Cash</span> <span>$48,000</span></div></td><td style="border: 1px solid #ddd; padding: 8px; width: 50%;"><div style="display: flex; justify-content: space-between;"><span>30 Sept Disposals</span> <span>$84,000</span></div><div style="display: flex; justify-content: space-between;"><span>Balance c/f</span> <span>$924,000</span></div></td></tr><tr><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;"><div style="display: flex; justify-content: space-between;"><span></span> <span>$1,008,000</span></div></td><td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;"><div style="display: flex; justify-content: space-between;"><span></span> <span>$1,008,000</span></div></td></tr></tbody></table>C Co's policy is to charge straight line depreciation at 20% per year on a pro rata basis.<br><br>What should be the charge for depreciation in C Co's statement of profit or loss for the year ended 31 December 20X6?`,
    options: [
      "A. $184,800",
      "B. $192,600",
      "C. $196,800",
      "D. $201,600"
    ],
    correctAnswerIndex: 1,
    explanation: `<strong>Step-by-Step Calculation</strong><br><br><strong>1. Plant held for the full 12 months:</strong><br>Cost = $960,000 (opening) - $84,000 (disposed) = $876,000<br>Depreciation = $876,000 &times; 20% = <strong>$175,200</strong><br><br><strong>2. Addition on 1 July 20X6 (Held for 6 months: July to December):</strong><br>Depreciation = $48,000 &times; 20% &times; (6/12) = <strong>$4,800</strong><br><br><strong>3. Disposal on 30 September 20X6 (Held for 9 months: January to September):</strong><br>Depreciation = $84,000 &times; 20% &times; (9/12) = <strong>$12,600</strong><br><br><strong>Total Depreciation Charge:</strong><br>Total Charge = $175,200 + $4,800 + $12,600 = <strong>$192,600</strong>`
  },
  {
    id: "q5_ias16",
    course: "acca",
    chapter: "Chapter 7: IAS 16 Property, Plant and Equipment",
    text: "At 1 April 20X4, a Property's cost was $12m (20-year original life), and Accumulated depreciation was $3.6m. It was revalued on 1 October 20X4 to $10.8m.<br><br>What is the depreciation charge for the year to 31 March 20X5?",
    options: [
      "A. $600,000",
      "B. $700,000",
      "C. $750,000",
      "D. $800,000"
    ],
    correctAnswerIndex: 1,
    explanation: `<strong>Exam Focus:</strong> For mid-year revaluations, you must split the year in two.<br><br><strong>Step-by-Step Calculation:</strong><br><br><strong>1. Months 1-6 (Pre-revaluation):</strong><br>Depreciation = ($12m / 20 years) &times; (6/12) = <strong>$300,000</strong><br><br><strong>2. Months 7-12 (Post-revaluation):</strong><br>First, find the remaining life at revaluation (1 October 20X4).<br>Past years depreciated = $3.6m / ($12m / 20) = 6 years.<br>Remaining life at start of year = 20 - 6 = 14 years.<br>Remaining life at revaluation (mid-year) = 14 - 0.5 = 13.5 years.<br><br>Depreciation = ($10.8m / 13.5 years) &times; (6/12) = <strong>$400,000</strong><br><br><strong>Total Depreciation Charge:</strong><br>Total = $300,000 + $400,000 = <strong>$700,000</strong>`
  }
];
