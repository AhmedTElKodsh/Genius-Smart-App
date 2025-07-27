# 🔑 Quick Login Reference - Genius Smart Education

**Last Updated:** July 26, 2025

## 🚀 Quick Test Logins

### 👑 Management Staff (Full Access)
| Name | Email | Password | Role |
|------|-------|----------|------|
| **إبراهيم حمدي** | `ibrahimmizo55@gmail.com` | `7s%6L9Lw^F` | Manager |
| **علي توفيق** | `alyytawfik5@gmail.com` | `H^18xmQma7` | Manager |
| **ماهيتاب مصطفى** | `mahetabmostafa92@gmail.com` | `k*tRxk9sSq` | Manager |

### 📚 Teachers (Limited Access)
| Name | Subject | Email | Password |
|------|---------|-------|----------|
| **محمود السيد** | Quran | `midomax817@gmail.com` | `B3bn@2OuDQ` |
| **ضحي سعد الدين** | Arabic | `ddodo3451@gmail.com` | `FiQ76M7%O0` |
| **همام حسام** | English | `homamdimashky@gmail.com` | `fL8$JruK6y` |
| **شيرين حسين** | Math | `shereen.hussein@school.edu` | `*Cd7GqWuUv` |
| **أميرة ناجي** | Science | `amiranagy901@gmail.com` | `Q!*T#h9kyL` |

---

## 📊 Database Statistics

- **Total Employees:** 34
- **Management Staff:** 10 (29.4%)
- **Academic Teachers:** 13 (38.2%)
- **Support Staff:** 11 (32.4%)

---

## 🔧 Development Notes

### Password Security
- All passwords are 10 characters long
- Include: Uppercase, lowercase, numbers, symbols
- Randomly generated and hashed with bcrypt

### Authority Levels
- **Management:** Full portal access + admin functions
- **Teachers:** Teacher portal only
- **Support:** Basic access

### Phone Format
- All numbers formatted for Saudi Arabia: `+966xxxxxxxxx`

### Employment Dates
- Range: 2020-2024
- Randomly distributed

### Absence Days
- Range: 15-25 days per employee
- Randomly assigned

---

## 📁 Complete Documentation

- **Full Details:** [`docs/EMPLOYEE_DATABASE.md`](./EMPLOYEE_DATABASE.md)
- **CSV Export:** [`docs/employee_credentials.csv`](./employee_credentials.csv)
- **Raw Data:** `server/data/teachers.json`

---

## 🔄 Data Management

### Update Data
```bash
# Add random passwords
cd server && node scripts/enhanceEmployeeData.js

# Import new CSV data
cd server && node scripts/importRealEmployeeData.js
```

### Backup Locations
- `server/data/teachers_backup_enhanced.json`
- `server/data/teachers_backup.json`

---

*Use this for quick testing and development reference!* 🎯 