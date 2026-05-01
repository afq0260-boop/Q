async function send() {
  const message = document.getElementById("msg").value;

  const res = await fetch("https://q-server-2.onrender.com/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: message
    })
  });

  const data = await res.json();

  document.getElementById("result").innerText = data.reply;
}