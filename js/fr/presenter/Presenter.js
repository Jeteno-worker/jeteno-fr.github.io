export class Presenter {
    constructor(view, model) {
        this.view = view
        this.model = model
        this.isSmileDetected = false;
        this.facePositionInterval = null;
        this.isBlinkDetected = false;
        this.checkTimeout = null;
    }

    async initStream() {
        const stream = await this.model.startStream()

        if (!stream) return

        const videoElement = this.view.createVideoBlock()

        videoElement.addEventListener('loadeddata', () => {
            this.view.createMaskVideo()
            this.view.createInfoBlock()
            this.view.updateInfoBlockMessage('Пожалуйста, подождите, идет настройка модели');
        });

        await this.model.init(videoElement)
        this.view.updateInfoBlockMessage('Модель успешно настроена');

        this.facePositionCheck()
    }

    smileCheck() {
        const infoTitle = document.querySelector('.info__title');

        const check = () => {
            if (infoTitle) {
                const isSmiling = this.model.smileCheck();
                if (isSmiling && !this.isSmileDetected) {
                    this.isSmileDetected = true;
                    this.view.updateInfoBlockMessage('Спасибо, проверка прошла');
                    this.stopTimeoutChecking();
                    this.blinkCheck()
                } else if (!isSmiling && !this.isSmileDetected) {
                    this.view.updateInfoBlockMessage('Пожалуйста, улыбнитесь');
                }
            }

            this.checkTimeout = setTimeout(check, 500)
        }

        check()
    }

    stopTimeoutChecking() {
        if (this.checkTimeout) {
            clearTimeout(this.checkTimeout);
            this.checkTimeout = null;
        }
    }

    facePositionCheck() {
        const faceMask = document.querySelector('.frame-mask');

        this.facePositionInterval = setInterval(() => {
            if (faceMask) {
                const {faceCenterX, faceCenterY, distance} = this.model.facePosition()
                const rect = faceMask.getBoundingClientRect();

                const normalizedX = faceCenterX / rect.width;
                const normalizedY = faceCenterY / rect.height;

                const maskZone = {
                    xMin: 0.20,
                    xMax: 0.40,
                    yMin: 0.45,
                    yMax: 0.60
                };

                const distanceZone = {
                    min: 0.30,
                    max: 0.40
                }

                const isWithinX = normalizedX >= maskZone.xMin && normalizedX <= maskZone.xMax;
                const isWithinY = normalizedY >= maskZone.yMin && normalizedY <= maskZone.yMax;
                const isDistanceZone = distance >= distanceZone.min && distance <= distanceZone.max;

                let positionMessage = '';
                if (!isWithinX && !isWithinY && !isDistanceZone) {
                    positionMessage = 'Пожалуйста, поместите лицо в центр кадра';
                } else if (!isDistanceZone) {
                    positionMessage = distance < distanceZone.min ? 'Отдалите камеру' : 'Приблизьте камеру';
                } else if (!isWithinX) {
                    positionMessage = normalizedX < maskZone.xMin ? 'Сместитесь влево' : 'Сместитесь вправо';
                } else if (!isWithinY) {
                    positionMessage = normalizedY < maskZone.yMin ? 'Опустите голову ниже' : 'Поднимите голову выше';
                } else {
                    positionMessage = 'Лицо в зоне маски';
                    this.stopFacePositionChecking()
                    this.smileCheck();
                }

                this.view.updateInfoBlockMessage(positionMessage)
            }
        }, 500)
    }

    stopFacePositionChecking() {
        if (this.facePositionInterval) {
            clearInterval(this.facePositionInterval);
            this.facePositionInterval = null;
        }
    }

    blinkCheck() {
        const infoTitle = document.querySelector('.info__title');

        const check = () => {
            if (infoTitle) {
                const isBlinking = this.model.eyeCheck();
                if (isBlinking && !this.isBlinkDetected) {
                    this.isBlinkDetected = true;
                    this.view.updateInfoBlockMessage('Спасибо, проверка прошла');
                    this.stopTimeoutChecking();

                } else if (!isBlinking && !this.isBlinkDetected) {
                    this.view.updateInfoBlockMessage('Пожалуйста, моргните');
                }
            }

            this.checkTimeout = setTimeout(check, 100)
        }

        check()
    }
}