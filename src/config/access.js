exports.access = {
  admin: ["admin"],
  doctor: ["admin", "doctor"],
  patient: ["admin", "patient"],
  all: ["admin", "manager", "doctor", "patient"],
  manager: ["admin", "manager"],
};
