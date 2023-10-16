import { useDeepgram } from "@/hooks/useDeepgram";
import { NextPage } from "next";

const DeepgramTest : NextPage = () => {
  const {
    transcript,
    transcribe,
    isTranscribing,
    closeConnection,
    setisTranscribing,
  } = useDeepgram()
  const startDeepgram = () => {
    transcribe("2");
  };
  const stopDeepgram = () => {
    closeConnection();
  };
  return (
    <>
      Lets see what happens here <br></br>
      <br></br>
      <br></br>
      <br></br>
      <button onClick={startDeepgram}>Start</button>
      <br></br>
      <br></br>
      <br></br>
      <button onClick={stopDeepgram}>Stop</button>
      <br></br>
      <p>{transcript}</p>
    </>
  );
};

export default DeepgramTest;
