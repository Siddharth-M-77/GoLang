export const resetBusiness = async () => {
  try {
    const result = await UserModel.updateMany(
      { totalInvestment: { $gt: 0 } },
      {
        $set: {
          currentMonthTotalInvestment: 0,
          currentMonthBusiness: 0,
        },
      },
    );
    console.log(`✅ Reset business for ${result.modifiedCount} users`);
  } catch (error) {
    console.error("❌ Error resetting business:", error);
  }
};
