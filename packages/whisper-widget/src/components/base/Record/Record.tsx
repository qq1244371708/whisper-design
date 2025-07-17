import Button from '../Button/Button';

const RecordBtn = () => {
  const handleRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // const options: Record<string, unknown> = {};
      // if (MediaRecorder.isTypeSupported('audio/mp4')) {
      //   options['mimeType'] = 'audio/mp4';
      // }

      const mediaRecorder = new MediaRecorder(stream);

      const audioChunks: Blob[] = []; // 存储音频数据块

      mediaRecorder.ondataavailable = event => {
        console.log('[ ondataavailable event ]', event);
        audioChunks.push(event.data); // 将数据块推入数组
      };

      mediaRecorder.onstop = () => {
        // 录制完成后，创建一个Blob对象并播放或下载
        const audioBlob = new Blob(audioChunks);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play(); // 播放录音

        // 如果需要下载录音，可以使用以下代码：
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = 'recorded-audio.mp3';
        link.click();
      };

      mediaRecorder.start(); // 开始录音
      console.log('[ start record ]');

      setTimeout(() => {
        mediaRecorder.stop();

        // 停止录音设备获取音频流
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }, 5000);
    } catch (error) {
      console.error('录音Err', error);
    }
  };

  return <Button onClick={handleRecord}>🎵录制</Button>;
};

export default RecordBtn;
