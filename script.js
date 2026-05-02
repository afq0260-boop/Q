async function send() {
  const message = document.getElementById("msg").value;

  const res = await fetch("https://q-2-4ryw.onrender.com/api/chat", {
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
