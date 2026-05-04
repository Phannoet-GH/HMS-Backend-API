exports.created = (res, data, message = 'Created successfully') => {
  return res.status(201).json({ message, data });
};

exports.ok = (res, data, message = 'Success') => {
  return res.status(200).json({ message, data });
};

exports.noContent = (res) => {
  return res.status(204).send();
};
