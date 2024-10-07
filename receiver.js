const dgram = require("dgram");
const receiver = dgram.createSocket("udp4");

const receiverPort = 4000;
let expectedSequenceNumber = 0;

receiver.on("message", (msg, rinfo) => {
  const packet = JSON.parse(msg.toString());

  if (packet.sequenceNumber === expectedSequenceNumber) {
    console.log(`Packet ${packet.sequenceNumber} received: ${packet.message}`);
    expectedSequenceNumber++;
  } else {
    console.log(
      `Duplicate or out-of-order packet received. Expected ${expectedSequenceNumber}, but got ${packet.sequenceNumber}.`
    );
  }

  // Send acknowledgment
  const ack = {
    sequenceNumber: packet.sequenceNumber,
  };

  receiver.send(
    Buffer.from(JSON.stringify(ack)),
    rinfo.port,
    rinfo.address,
    (err) => {
      if (err) {
        console.log("Error sending ACK:", err);
      } else {
        console.log(`ACK for packet ${packet.sequenceNumber} sent.`);
      }
    }
  );
});

receiver.bind(receiverPort, () => {
  console.log(`Receiver listening on port ${receiverPort}`);
});
