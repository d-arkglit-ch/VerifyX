async function test() {
  try {
    let token;
    try {
      // Signup
      const res1 = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Test", email: "test6@test.com", password: "password123", role: "issuer"
        })
      });
      console.log("Signup:", await res1.json());
    } catch(e) {}

    
    // Login
    const res2 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: "test6@test.com", password: "password123"
      })
    });
    const data2 = await res2.json();
    console.log("Login output:", data2);
    token = data2.token;
    
    if (!token) {
      console.log("Failed to get token, aborting.");
      return;
    }

    
    // Issue
    const res3 = await fetch('http://localhost:5000/api/documents/issue', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        issuedTo: "John Doe",
        issuedBy: "MIT",
        issueDate: "2026-05-17",
        hash: "mockhash12345"
      })
    });
    
    const data3 = await res3.json();
    console.log(JSON.stringify(data3, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
