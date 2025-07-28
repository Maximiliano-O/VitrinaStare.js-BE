// Utility function that helps to answer HTTP requests
// Payload could be an object or an error
// e.g: sendResponse(res, 200, "User created successfully!", user);
//
// Response format:
// {
//   message: string,       // Description of the response
//   result?: object,       // Present if payload is a successful result
//   error?: string         // Present if payload is an Error
// }
//
// Frontend example of unwrapping the response:
//
// async function fetchData() {
//   try {
//     const response = await axios.get('/api/endpoint');
//     const data = response.data;
//     
//     if (data.error) {
//       // Handle error (e.g., show message to user)
//       console.error('Error:', data.error);
//     } else {
//       // Use the successful result
//       console.log('Result:', data.result);
//     }
//   } catch (error) {
//     // Handle network or unexpected errors
//     console.error('Request failed:', error);
//   }
// }
//
// fetchData();
//
function sendResponse(res, statusCode, message, payload = null) {
  const responseBody = { message };

  if (payload instanceof Error) {
    responseBody.error = payload.message || payload.toString();
  } else if (payload !== null) {
    responseBody.result = payload;
  }

  res.status(statusCode).json(responseBody);
}

export default sendResponse;