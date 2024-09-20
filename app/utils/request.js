export async function verifyFields(body, requiredFields, res) {
  const missingFields = requiredFields.filter((field) => !(field in body));

  if (missingFields.length > 0) {
    return res.status(400).send({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }
}
