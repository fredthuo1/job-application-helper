export const generateCoverLetter = async (jobDescription, resumeText) => {
  try {
    // Simulate API logic for generating a cover letter
    const coverLetter = `
      Dear Hiring Manager,

      I am excited to apply for the position described in your job posting. Based on my resume, I possess skills that align closely with your requirements: ${jobDescription}. 

      I bring expertise in various areas mentioned in the job description, and my resume highlights how my experiences complement your organization's needs.

      Looking forward to discussing my qualifications further!

      Sincerely,
      [Your Name]
    `;

    // Return the generated cover letter
    return coverLetter;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter.");
  }
};
