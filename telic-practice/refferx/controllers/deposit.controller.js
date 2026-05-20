import crypto from "crypto";
import UserModel from "../models/user.model.js";
import Deposit from "../models/Automaticdeposit.model.js";
import { create } from "domain";

// ─── OxaPay Config ───
const OXAPAY_API_KEY = process.env.OXAPAY_MERCHANT_API_KEY;
const OXAPAY_BASE = "https://api.oxapay.com/merchants";
const WEBHOOK_URL = process.env.OXAPAY_WEBHOOK_URL;
const USDT_BSC_CONTRACT = "0x55d398326f99059fF775485246999027B3197955";

// export const createDeposit = async (req, res) => {
//   try {
//     const { amount } = req.body;
//     const userId = req.user?._id || req.user?.id;
//     const user = await UserModel.findById(userId);

//     if (!user) {
//       return res
//         .status(404)
//         .json({ success: false, message: "User not found" });
//     }

//     const userEmail = user.email;

//     // ── Validation ──
//     if (!amount || isNaN(amount) || Number(amount) <= 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Valid amount daalo" });
//     }
//     if (Number(amount) > 1000) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Maximum deposit: $1000" });
//     }

//     const orderId = `DEP-${userId}-${Date.now()}`;

//     // ── OxaPay API Call ──
//     const oxaResponse = await fetch(`${OXAPAY_BASE}/request/whitelabel`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         merchant: OXAPAY_API_KEY,
//         amount: Number(amount),
//         currency: "USD",
//         payCurrency: "USDT",
//         network: "BSC",
//         lifeTime: 30,
//         feePaidByPayer: 0,
//         underPaidCover: 5,
//         callbackUrl: WEBHOOK_URL,
//         returnUrl: process.env.FRONTEND_URL || "http://localhost:3000",
//         description: `Deposit $${amount} by ${userEmail}`,
//         orderId: orderId,
//         email: userEmail,
//       }),
//     });

//     const oxaData = await oxaResponse.json();

//     if (oxaData.result !== 100) {
//       console.error("❌ OxaPay Error:", oxaData);
//       return res.status(400).json({
//         success: false,
//         message: oxaData.message || "OxaPay se payment create nahi hua",
//         errorCode: oxaData.result,
//       });
//     }

//     // ── Universal QR & PayLink (sab wallets compatible) ──
//     const usdtAmount = oxaData.payAmount || Number(amount);
//     const amountInWei = BigInt(Math.round(usdtAmount * 1e18)).toString();
//     const payLink = `ethereum:${USDT_BSC_CONTRACT}@56/transfer?address=${oxaData.address}&uint256=${amountInWei}`;
//     const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(payLink)}&size=250x250&margin=10`;

//     // ── Save to Database ──
//     const deposit = await Deposit.create({
//       userId,
//       email: userEmail,
//       amount: Number(amount),
//       payAmount: usdtAmount,
//       currency: "USD",
//       payCurrency: "USDT",
//       network: "BSC",
//       trackId: String(oxaData.trackId),
//       orderId: orderId,
//       address: oxaData.address || "",
//       qrCodeUrl: qrCodeUrl,
//       payLink: payLink,
//       expiredAt: oxaData.expiredAt
//         ? new Date(Number(oxaData.expiredAt) * 1000)
//         : new Date(Date.now() + 30 * 60000),
//       status: "Waiting",
//     });

//     console.log(
//       `✅ Deposit Created: ${deposit.trackId} | $${amount} | ${userEmail}`,
//     );

//     // ── Return to Frontend ──
//     return res.status(200).json({
//       success: true,
//       message: "Deposit created successfully",
//       data: {
//         trackId: deposit.trackId,
//         orderId: deposit.orderId,
//         address: deposit.address,
//         payAmount: deposit.payAmount,
//         qrCodeUrl: deposit.qrCodeUrl,
//         payLink: deposit.payLink,
//         usdtContract: USDT_BSC_CONTRACT,
//         networkChainId: 56,
//         expiredAt: deposit.expiredAt,
//         status: deposit.status,
//         network: "BSC (BEP20)",
//         payCurrency: "USDT",
//       },
//     });
//   } catch (error) {
//     console.error("❌ Create Deposit Error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

// ════════════════════════════════════════════════════════
//  2. WEBHOOK - OxaPay payment status update bhejta hai
//  OxaPay → POST /api/deposit/webhook → DB update
// ════════════════════════════════════════════════════════

export const createDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user?._id || req.user?.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const userEmail = user.email;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid amount daalo" });
    }
    if (Number(amount) > 1000) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum deposit: $1000" });
    }

    const orderId = `DEP-${userId}-${Date.now()}`;

    const oxaResponse = await fetch(`${OXAPAY_BASE}/request/whitelabel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: OXAPAY_API_KEY,
        amount: Number(amount),
        currency: "USD",
        payCurrency: "USDT",
        network: "BSC",
        lifeTime: 30,
        feePaidByPayer: 0,
        underPaidCover: 5,
        callbackUrl: WEBHOOK_URL,
        returnUrl: process.env.FRONTEND_URL || "http://localhost:3000",
        description: `Deposit $${amount} by ${userEmail}`,
        orderId: orderId,
        email: userEmail,
      }),
    });

    const oxaData = await oxaResponse.json();

    if (oxaData.result !== 100) {
      console.error("❌ OxaPay Error:", oxaData);
      return res.status(400).json({
        success: false,
        message: oxaData.message || "OxaPay se payment create nahi hua",
        errorCode: oxaData.result,
      });
    }

    const usdtAmount = oxaData.payAmount || Number(amount);
    const recipientAddress = oxaData.address;

    // ── Amount in proper formats ──
    const amountInWei = BigInt(Math.round(usdtAmount * 1e18)).toString();
    const amountFormatted = usdtAmount.toFixed(6); // Human readable

    // ────────────────────────────────────────────────────
    // QR FORMAT STRATEGY:
    // MetaMask     → ethereum: EIP-681 URI (auto-fills contract + amount)
    // Trust Wallet → trust://... deep link ya plain address QR
    // SafePal      → Plain wallet address QR (manual amount entry)
    // Universal    → Plain address (sabse compatible)
    // ────────────────────────────────────────────────────

    // 1️⃣ MetaMask / EIP-681 compatible wallets
    const metaMaskLink = `ethereum:${USDT_BSC_CONTRACT}@56/transfer?address=${recipientAddress}&uint256=${amountInWei}`;

    // 2️⃣ Trust Wallet deep link (token send screen directly open ho jaata hai)
    const trustWalletLink = `trust://send?asset=c20000714_t${USDT_BSC_CONTRACT}&address=${recipientAddress}&amount=${amountFormatted}&memo=Deposit`;

    // 3️⃣ SafePal & universal wallets → Plain address QR
    // SafePal scan karta hai plain address, phir user manually amount daalta hai
    const plainAddressQR = recipientAddress;

    // 4️⃣ BEP20 standard URI (kuch wallets isko bhi samajhte hain)
    const bep20Link = `bnb:${recipientAddress}?contractAddress=${USDT_BSC_CONTRACT}&amount=${amountFormatted}`;

    // ── QR Code URLs generate karo ──
    const baseQR =
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=10";

    const qrCodes = {
      // MetaMask ke liye — EIP-681 URI
      metamask: `${baseQR}&data=${encodeURIComponent(metaMaskLink)}`,

      // Trust Wallet ke liye — deep link
      trustwallet: `${baseQR}&data=${encodeURIComponent(trustWalletLink)}`,

      // SafePal ke liye — plain address (most compatible)
      safepal: `${baseQR}&data=${encodeURIComponent(plainAddressQR)}`,

      // Universal fallback — plain address
      universal: `${baseQR}&data=${encodeURIComponent(plainAddressQR)}`,
    };

    // ── Save to Database ──
    const deposit = await Deposit.create({
      userId,
      email: userEmail,
      amount: Number(amount),
      payAmount: usdtAmount,
      currency: "USD",
      payCurrency: "USDT",
      network: "BSC",
      trackId: String(oxaData.trackId),
      orderId: orderId,
      address: recipientAddress,
      qrCodeUrl: qrCodes.universal, // backward compatibility ke liye
      payLink: metaMaskLink, // backward compatibility ke liye
      expiredAt: oxaData.expiredAt
        ? new Date(Number(oxaData.expiredAt) * 1000)
        : new Date(Date.now() + 30 * 60000),
      status: "Waiting",
    });

    console.log(
      `✅ Deposit Created: ${deposit.trackId} | $${amount} | ${userEmail}`,
    );

    return res.status(200).json({
      success: true,
      message: "Deposit created successfully",
      data: {
        trackId: deposit.trackId,
        orderId: deposit.orderId,
        address: recipientAddress,
        payAmount: usdtAmount,
        payAmountFormatted: `${amountFormatted} USDT`,

        // ── Wallet-specific QR codes ──
        qrCodes: {
          metamask: qrCodes.metamask, // MetaMask scan karo → auto fill
          trustwallet: qrCodes.trustwallet, // Trust Wallet scan karo → auto fill
          safepal: qrCodes.safepal, // SafePal scan karo → address copy/fill
          universal: qrCodes.universal, // Koi bhi wallet → plain address
        },

        // ── Deep links (button se wallet directly open) ──
        deepLinks: {
          metamask: metaMaskLink,
          trustwallet: trustWalletLink,
          bep20: bep20Link,
        },

        // ── Backward compatible fields ──
        qrCodeUrl: qrCodes.universal,
        payLink: metaMaskLink,

        usdtContract: USDT_BSC_CONTRACT,
        networkChainId: 56,
        expiredAt: deposit.expiredAt,
        status: deposit.status,
        network: "BSC (BEP20)",
        payCurrency: "USDT",
      },
    });
  } catch (error) {
    console.error("❌ Create Deposit Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const webhook = async (req, res) => {
  try {
    const data = req.body;

    console.log("📩 Webhook received:", JSON.stringify(data, null, 2));

    // ── HMAC Verification (Optional but recommended) ──
    // OxaPay sends HMAC in the request for verification
    // You can verify using your API key as the secret
    // const hmac = req.headers['hmac'] || data.hmac;
    // if (hmac) {
    //   const computed = crypto.createHmac('sha512', OXAPAY_API_KEY)
    //     .update(JSON.stringify(data.data || data))
    //     .digest('hex');
    //   if (computed !== hmac) {
    //     console.error("❌ HMAC verification failed");
    //     return res.status(403).json({ message: "Invalid HMAC" });
    //   }
    // }

    // ── Extract data ──
    // OxaPay webhook format can vary, handle both
    const trackId = String(
      data.trackId || data.track_id || data.data?.track_id || "",
    );
    const status = data.status || data.data?.status || "";
    const txHash = data.txID || data.data?.txs?.[0]?.tx_hash || "";
    const senderAddress =
      data.senderAddress || data.data?.txs?.[0]?.sender_address || "";

    if (!trackId) {
      console.error("❌ Webhook: No trackId found");
      return res.status(400).json({ message: "trackId missing" });
    }

    // ── Find deposit in DB ──
    const deposit = await Deposit.findOne({ trackId });

    if (!deposit) {
      console.error(`❌ Webhook: Deposit not found for trackId: ${trackId}`);
      return res.status(404).json({ message: "Deposit not found" });
    }

    // ── Update deposit status ──
    deposit.status = mapOxaPayStatus(status);
    deposit.webhookData = data;

    if (txHash) deposit.txHash = txHash;
    if (senderAddress) deposit.senderAddress = senderAddress;

    if (deposit.status === "Paid" && !deposit.paidAt) {
      deposit.paidAt = new Date();
      await creditUserBalance(deposit); // ✅ yeh add karo

      // ════════════════════════════════════════════
      //  👇 YAHAN PE USER KA BALANCE UPDATE KARO
      //  Example:
      //  await User.findByIdAndUpdate(deposit.userId, {
      //    $inc: { balance: deposit.amount }
      //  });
      // ════════════════════════════════════════════
      console.log(
        `💰 DEPOSIT PAID! User: ${deposit.userId} | Amount: $${deposit.amount}`,
      );
    }

    await deposit.save();

    console.log(`✅ Webhook processed: ${trackId} → ${deposit.status}`);

    // OxaPay expects 200 response
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};

// ════════════════════════════════════════════════════════
//  3. CHECK STATUS - Frontend polls this endpoint
//  GET /api/deposit/status/:trackId
// ════════════════════════════════════════════════════════

const mapOxaPayStatus = (oxaStatus) => {
  const map = {
    new: "New",
    waiting: "Waiting",
    confirming: "Confirming",
    paid: "Paid",
    expired: "Expired",
    failed: "Failed",
    New: "New",
    Waiting: "Waiting",
    Confirming: "Confirming",
    Paid: "Paid",
    Expired: "Expired",
    Failed: "Failed",
  };
  return map[oxaStatus] || "Waiting";
};

export const checkStatus = async (req, res) => {
  try {
    const { trackId } = req.params;

    if (!trackId) {
      return res
        .status(400)
        .json({ success: false, message: "trackId required" });
    }

    let deposit = await Deposit.findOne({ trackId: String(trackId) });

    if (!deposit) {
      return res
        .status(404)
        .json({ success: false, message: "Deposit not found" });
    }

    if (["New", "Waiting"].includes(deposit.status)) {
      try {
        const oxaResponse = await fetch(`${OXAPAY_BASE}/inquiry`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            merchant: OXAPAY_API_KEY,
            trackId: String(trackId),
          }),
        });

        const oxaData = await oxaResponse.json();

        if (oxaData.result === 100) {
          const newStatus = mapOxaPayStatus(oxaData.status);

          if (newStatus !== deposit.status) {
            deposit.status = newStatus;
            if (oxaData.txID) deposit.txHash = oxaData.txID;
            if (newStatus === "Paid" && !deposit.paidAt) {
              await creditUserBalance(deposit);
              deposit.paidAt = new Date();

              console.log(
                `💰 Status check: PAID! User: ${deposit.userId} | Amount: $${deposit.amount}`,
              );
            }
            await deposit.save();
          }
        }
      } catch (err) {
        console.error("OxaPay inquiry error:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        trackId: deposit.trackId,
        orderId: deposit.orderId,
        amount: deposit.amount,
        payAmount: deposit.payAmount,
        address: deposit.address,
        status: deposit.status,
        txHash: deposit.txHash,
        network: deposit.network,
        expiredAt: deposit.expiredAt,
        paidAt: deposit.paidAt,
        createdAt: deposit.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Check Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const depositHistory = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const [deposits, total] = await Promise.all([
      Deposit.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      Deposit.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: deposits,
      total,
    });
  } catch (error) {
    console.error("❌ Deposit History Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const depositHistory5limit = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const [deposits, total] = await Promise.all([
      Deposit.find({ userId }).sort({ amount: -1 }).limit(5).lean(),
      Deposit.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: deposits,
      total,
    });
  } catch (error) {
    console.error("❌ Deposit History Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const creditUserBalance = async (deposit) => {
  try {
    await UserModel.findByIdAndUpdate(
      deposit.userId,
      {
        $inc: { mainWallet: deposit.amount },
      },
      { new: true },
    );
    console.log(
      `✅ Balance credited: $${deposit.amount} → User: ${deposit.userId}`,
    );
  } catch (err) {
    console.error("❌ Balance credit error:", err.message);
  }
};
