const dgram = require("dgram");
const sender = dgram.createSocket("udp4");

const receiverPort = 4000;
const receiverHost = "localhost";

let sequenceNumber = 0;
let message = "Hello, Receiver!";

function sendPacket() {
  let packet = {
    sequenceNumber: sequenceNumber,
    message: message,
  };

  const packetData = Buffer.from(JSON.stringify(packet));

  sender.send(packetData, receiverPort, receiverHost, (err) => {
    if (err) {
      console.log("Error sending packet:", err);
    } else {
      console.log(`Packet with sequence number ${sequenceNumber} sent.`);
    }
  });

  // Set a timeout to wait for the acknowledgment
  setTimeout(() => {
    if (!ackReceived) {
      console.log(
        `Timeout! Resending packet with sequence number ${sequenceNumber}...`
      );
      sendPacket(); // Resend the packet
    }
  }, 3000); // 3-second timeout
}

let ackReceived = false;

sender.on("message", (msg, rinfo) => {
  const ack = JSON.parse(msg.toString());

  if (ack.sequenceNumber === sequenceNumber) {
    console.log(`ACK received for packet ${sequenceNumber}.`);
    ackReceived = true;
    sequenceNumber++;

    // After receiving ACK, we can send the next packet
    setTimeout(sendPacket, 1000);
  }
});

// Send the first packet
sendPacket();
