const ok = (res, data, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data
  });
};

const created = (res, data, message = 'Created') => {
  res.status(201).json({
    success: true,
    message,
    data
  });
};

export default {
  ok,
  created
};
