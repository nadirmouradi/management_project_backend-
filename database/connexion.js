import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config()

const connexion = mysql.createConnection({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,       
    password: process.env.DB_PASSWORD,       
    database: process.env.DB_NAME  
});

connexion.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

export default connexion;