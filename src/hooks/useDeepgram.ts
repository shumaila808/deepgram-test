
import { useEffect, useRef, useState } from 'react'
// @ts-ignore
import { Deepgram } from '@deepgram/sdk/browser'

export const useDeepgram = () => {
  const [audioStream, setaudioStream] = useState<MediaStream>()
  const [transcript, setTranscript] = useState<string[]>([])
  const [currentTranscriptConfidence, setCurrentTranscriptConfidence] = useState<number | null>(0)
  const [emptyPacketCounter, setEmptyPacketCounter] = useState<number>(0)
  const [isAnswered, setIsAnswered] = useState<boolean | null>(null)
  const [isTranscribing, setisTranscribing] = useState<boolean | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [webSocket, setWebSocket] = useState<any>(null)
  const [startTime, setstartTime] = useState<any>(null)
  const [isDeepgramReady, setIsDeepgramReady] = useState(false)
  const [key, setKey] = useState<string | null>(null)

  const initAudioStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setaudioStream(stream)
      setIsDeepgramReady(true)
    } catch (err) {
      console.error('Error initializing audio stream:', err)
      // Show user-friendly error message
    }
  }
  const deepgram = new Deepgram('3b4bea0a0ca3061f1769313729b6927ae062dfca')
  const transcribe = (key: string | null) => {
    setKey(key)
    setTranscript([])
    if (audioStream) mediaRecorderRef.current = new MediaRecorder(audioStream)
    else {

    }
    const deepgramSocket = deepgram.transcription.live({
      interim_results: true,
      endpointing: 250,
      model: 'nova', // Best variant with limited speech issues
      language: sessionStorage.getItem('language') ? sessionStorage.getItem('language') : 'en-GB',
    })
    deepgramSocket.addEventListener('error', (error: any) => {
     alert("error")
     console.log(error)
    })

    setWebSocket(deepgramSocket)

    // Open Listener
    deepgramSocket.addEventListener('open', () => {
     
      mediaRecorderRef.current!.addEventListener('dataavailable', async (event: any) => {
        if (event.data.size > 0 && deepgramSocket.readyState == 1) {
          deepgramSocket.send(event.data)
        } else {
          if (deepgramSocket.readyState === 3) {
            alert("state 3")
            mediaRecorderRef.current?.stop()
            deepgramSocket.close()
            setTimeout(() => {
              transcribe(key) // Retry the connection
            }, 5000) // Set an appropriate retry delay
            return
          }
        }
      })
      mediaRecorderRef.current?.start(250)
      setisTranscribing(true)
    })

    // close
    deepgramSocket.addEventListener('close', () => {
      alert("closing")
    })

    // error

    // Message Listener
    deepgramSocket.addEventListener('message', (message: { data: string }) => {
      const received = JSON.parse(message.data)
      if (received && received.channel) {
        const currentTranscriptLocal = received.channel.alternatives[0].transcript
        const wordsLength = received.channel.alternatives[0].words.length
        setCurrentTranscriptConfidence(received.channel.alternatives[0].confidence)
        if (currentTranscriptLocal.length > 0 && received.is_final) {
          setTranscript((current: any) => [...current, ' ' + currentTranscriptLocal])
          setCurrentTranscriptConfidence(received.channel.alternatives[0].confidence)
        }
        //if this is the question where automatic recognition should happen
        if (key === '1') {
          // if user has answered
          if (!currentTranscriptLocal) {
            setEmptyPacketCounter(prevState => {
              return prevState + 1
            })
          } else {
            setEmptyPacketCounter(0)
          }
          if (currentTranscriptLocal.length > 0 && wordsLength > 0) {
            setIsAnswered(true)
          }
        }
      }
    })
  }

  const closeConnection = () => {
    setisTranscribing(false)
    setIsAnswered(false)
    setEmptyPacketCounter(0)
    mediaRecorderRef.current?.stop()
    webSocket.close()
   
  }

  useEffect(() => {
    // if user has answered and we get an empty event after that : end of speech
    if (isAnswered && emptyPacketCounter >= 3 && key == '1') {
      if (transcript.length > 0) {
        
        closeConnection()
      } else {
        
      }
    } else {
      
    }
  }, [isAnswered, transcript, emptyPacketCounter, key])
  useEffect(() => {
    initAudioStream()
  }, [])
  useEffect(() => {
    return () => {
      // closeConnection()
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])
  return {
    transcript,
    transcribe,
    isTranscribing,
    closeConnection,
    isDeepgramReady,
    setisTranscribing,
  }
}
