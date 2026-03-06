const OpenAI = require("openai");
const ApiError = require("../utils/apiError.utils");
const Appointment = require("../models/appointmentmodels");
const Doctor = require("../models/doctorsmodel");

const client = new OpenAI({
  apiKey: process.env.SAMBANOVA_API_KEY,
  baseURL: "https://api.sambanova.ai/v1",
});

exports.chatWithBot = async (req, res, next) => {
  try {
    const { message } = req.body;
    const user = req.user;

    if (!message) throw new ApiError(400, "Message is required");

    let contextData = "";

    /* =========================
       INTENT: MY APPOINTMENTS
       ========================= */
    if (
      user.role === "patient" &&
      /my appointments|upcoming appointment/i.test(message)
    ) {
      const appointments = await Appointment.find({
        patientId: user._id,
        status: { $in: ["PENDING", "CONFIRMED"] },
      })
        .populate("doctorId", "name specialization")
        .sort({ date: 1 });

      if (!appointments.length) {
        contextData = "You have no upcoming appointments.";
      } else {
        contextData = appointments
          .map(
            (a) =>
              `Doctor ${a.doctorId.name} on ${a.date} at ${a.slot} (${a.status})`
          )
          .join("\n");
      }
    }

    /* =========================
       INTENT: AVAILABLE DOCTORS
       ========================= */
    else if (/available doctors|list doctors/i.test(message)) {
      const doctors = await Doctor.find().select("name specialization location");

      contextData = doctors
        .map((d) => `${d.name} - ${d.specialization} (${d.location})`)
        .join("\n");
    }

    /* =========================
       FALLBACK: FAQ / GENERAL
       ========================= */
    else {
      contextData = "Answer generally. Do not assume access to private data.";
    }

    /* =========================
       AI RESPONSE
       ========================= */
    const response = await client.chat.completions.create({
      model: "Meta-Llama-3.1-8B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "You are a hospital assistant. Use ONLY the provided context. Never invent or assume data.",
        },
        {
          role: "system",
          content: `Context:\n${contextData}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 250,
    });

    res.json({
      success: true,
      data: {
        reply: response.choices[0].message.content,
      },
    });
  } catch (err) {
    next(err);
  }
};
