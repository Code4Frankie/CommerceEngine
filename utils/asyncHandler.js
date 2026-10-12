const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
      requestHandler(req, res, next).catch(next);
    };
  };
  
  export default asyncHandler; 
  