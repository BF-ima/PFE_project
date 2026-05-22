const bcrypt = require('bcrypt');

const users = [
  { id: 1, first_name: 'Ahmed', last_name: 'Benali', email: 'ahmed.benali@esi-sba.dz', role: 'super_admin', password: 'ahmed123' },
  { id: 2, first_name: 'Fatima', last_name: 'Zohra', email: 'fatima.zohra@esi-sba.dz', role: 'admin', password: 'fatima123' },
  { id: 3, first_name: 'Mohamed', last_name: 'Bouzid', email: 'mohamed.bouzid@esi-sba.dz', role: 'admin', password: 'mohamed123' },
  { id: 4, first_name: 'Karim', last_name: 'Haddad', email: 'karim.haddad@esi-sba.dz', role: 'enseignant', password: 'karim123' },
  { id: 5, first_name: 'Nadia', last_name: 'Khelifi', email: 'nadia.khelifi@esi-sba.dz', role: 'enseignant', password: 'nadia123' },
  { id: 6, first_name: 'Sofiane', last_name: 'Mansouri', email: 'sofiane.mansouri@esi-sba.dz', role: 'enseignant', password: 'sofiane123' },
  { id: 7, first_name: 'Leila', last_name: 'Bouaziz', email: 'leila.bouaziz@esi-sba.dz', role: 'enseignant', password: 'leila123' },
  { id: 8, first_name: 'Omar', last_name: 'Chebbi', email: 'omar.chebbi@esi-sba.dz', role: 'enseignant', password: 'omar123' },
  { id: 9, first_name: 'Samira', last_name: 'Guezmir', email: 'samira.guezmir@esi-sba.dz', role: 'entreprise', password: 'samira123' },
  { id: 10, first_name: 'Walid', last_name: 'Touati', email: 'walid.touati@esi-sba.dz', role: 'entreprise', password: 'walid123' },
  { id: 11, first_name: 'Amina', last_name: 'Bensalem', email: 'amina.bensalem@esi-sba.dz', role: 'etudiant', password: 'amina123' },
  { id: 12, first_name: 'Bilal', last_name: 'Mokhtari', email: 'bilal.mokhtari@esi-sba.dz', role: 'etudiant', password: 'bilal123' },
  { id: 13, first_name: 'Chaima', last_name: 'Hadjadj', email: 'chaima.hadjadj@esi-sba.dz', role: 'etudiant', password: 'chaima123' },
  { id: 14, first_name: 'Djamel', last_name: 'Benmoussa', email: 'djamel.benmoussa@esi-sba.dz', role: 'etudiant', password: 'djamel123' },
  { id: 15, first_name: 'Ines', last_name: 'Kherbouche', email: 'ines.kherbouche@esi-sba.dz', role: 'etudiant', password: 'ines123' },
  { id: 16, first_name: 'Khaled', last_name: 'Saidani', email: 'khaled.saidani@esi-sba.dz', role: 'etudiant', password: 'khaled123' },
  { id: 17, first_name: 'Lydia', last_name: 'Boudiaf', email: 'lydia.boudiaf@esi-sba.dz', role: 'etudiant', password: 'lydia123' },
  { id: 18, first_name: 'Mehdi', last_name: 'Zerrouki', email: 'mehdi.zerrouki@esi-sba.dz', role: 'etudiant', password: 'mehdi123' },
  { id: 19, first_name: 'Nour', last_name: 'Ait', email: 'nour.ait@esi-sba.dz', role: 'etudiant', password: 'nour123' },
  { id: 20, first_name: 'Oussama', last_name: 'Bellil', email: 'oussama.bellil@esi-sba.dz', role: 'etudiant', password: 'oussama123' }
];

async function generateHashes() {
  console.log('INSERT INTO users (id, first_name, last_name, email, password, role, is_active, created_at, created_by, phone) VALUES');
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const hash = await bcrypt.hash(user.password, 10);
    const comma = i < users.length - 1 ? ',' : ';';
    
    console.log(`(${user.id}, '${user.first_name}', '${user.last_name}', '${user.email}', '${hash}', '${user.role}', 1, '2026-01-01 08:00:00', 1, '05500000${user.id}')${comma}`);
  }
}

generateHashes();