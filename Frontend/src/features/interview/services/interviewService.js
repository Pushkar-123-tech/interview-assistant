const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (url, options = {}) => {
  const response = await fetch(url, options);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

export const createInterview = async (config) => {
  return request(`${API_URL}/interviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });
};

export const submitAnswer = async (
  interviewId,
  questionId,
  answer
) => {
  return request(
    `${API_URL}/interviews/${interviewId}/answers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionId,
        answer,
      }),
    }
  );
};

export const completeInterview = async (interviewId) => {
  return request(
    `${API_URL}/interviews/${interviewId}/complete`,
    {
      method: "POST",
    }
  );
};

export const getInterviewResult = async (interviewId) => {
  return request(`${API_URL}/interviews/${interviewId}/result`);
};