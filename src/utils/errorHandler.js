export const handleError = (error) => {
  if (error.response) {
    return "Server error. Please try again.";
  } else if (error.request) {
    return "Network error. Check internet connection.";
  } else {
    return "Something went wrong.";
  }
};
