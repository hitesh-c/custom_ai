const axios = require('axios');

const sheetUrl = 'https://docs.google.com/spreadsheets/d/1cCnJtUjLHTFEjKbniXhl2iVYj08hp8NIsRrJNv355iw/edit'; // **Warning: Don't use public sheets for real data**
const data = {
    'name': 'John Doe',
    'email': 'johndoe@example.com',
};

axios.post(sheetUrl, data, {
    headers: {
        'Content-Type': 'application/json',
    }
})
.then((response) => {
    console.log(`statusCode: ${response.status}`);
    console.log(response.data);
})
.catch((error) => {
    console.error(error);
});
