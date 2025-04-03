const vaccinationRecord = [
  {
    id: "vr1",
    petId: "pet-1",
    vaccineName: "Rabies Vaccine",
    vaccineType: "Anti-Rabies",
    dateAdministered: "2023-05-10",
    nextDueDate: "2024-05-10",
    vetName: "Dr. Sharma",
    clinic: "human Care Clinic",
    notes: "Annual vaccine administered without complications.",
  },
  {
    id: "vr2",
    petId: "pet-1",
    vaccineName: "DHPP",
    vaccineType: "DHPP",
    dateAdministered: "2023-03-15",
    nextDueDate: "2024-03-15",
    vetName: "Dr. Patel",
    clinic: "Pet Care Clinic",
    batchNumber: "DHPP789",
    notes:
      "Combination vaccine for distemper, hepatitis, parainfluenza, and parvovirus.",
  },
  {
    id: "vr3",
    petId: "pet-2",
    vaccineName: "FVRCP",
    vaccineType: "FVRCP",
    dateAdministered: "2023-07-22",
    nextDueDate: "2024-07-22",
    vetName: "Dr. Gupta",
    clinic: "Feline Health Center",
    notes: "Core vaccine for cats.",
  },
];

const vaccinationSchedule = [
    {
        id: "vs1",
        petId: "pet-1",
        vaccineName: "Rabies Vaccine",
        vaccineType: "Anti-Rabies",
        dateAdministered: "2023-05-10",
        nextDueDate: "2024-05-10",
        vetName: "Dr. Sharma",
        clinic: "Pet Care Clinic",
        notes: "Annual vaccine administered without complications.",
    },
    {
        id: "vs2",
        petId: "pet-2",
        vaccineName: "FVRCP",
        vaccineType: "FVRCP",
        dateAdministered: "2023-07-22",
        nextDueDate: "2024-07-22",
        vetName: "Dr. Gupta",
        clinic: "Feline Health Center",
        notes: "Core vaccine for cats.",
    },
    ];

export const VaccinationRecord = async (req, res) => {
    const { petId } = req.query;
  
    if (!petId) {
      return res.status(400).json({ message: "petId is required" });
    }
  
    // Filter vaccination records based on petId
    const filteredData = vaccinationRecord.filter((record) => record.petId === petId)
  
    // If no records are found, return a 404 response
    if (filteredData.length === 0) {
      return res.status(404).json({ message: "No vaccination records found for this petId", data : []});
    }
  
    res.status(200).json({ message: "Vaccination records fetched successfully", data : filteredData });
  };
  
export const VaccinationSchedule = async (req, res) => {
    const { petId } = req.query;
  
    if (!petId) {
      return res.status(400).json({ message: "petId is required" });
    }
  
    // Filter vaccination records based on petId
    const filteredData = vaccinationSchedule.filter((record) => record.petId === petId)
  
    // If no records are found, return a 404 response
    if (filteredData.length === 0) {
      return res.status(404).json({ message: "No vaccination records found for this petId", data : []});
    }
  
    res.status(200).json({ message: "Vaccination records fetched successfully", data : filteredData });
  }