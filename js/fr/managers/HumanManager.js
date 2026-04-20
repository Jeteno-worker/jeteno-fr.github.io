export class HumanManager {
    constructor(videoElement) {
        this.human = null;
        this.videoElement = videoElement;
    }

    async init () {
        this.human = new Human.Human({
            debug: false,
            backend: 'webgl',
            modelBasePath: './public/models',
            face: {
                enabled: true, //Сетка лица
                detector: { rotation: false },
                mesh: { enabled: true }, // Детальная сетка для точек глаз
                attention: { enabled: false },
                iris: { enabled: false }, // Включение точек радужки
                description: { enabled: false },
                emotion: { enabled: true },
                antispoof: { enabled: false },
                liveness: { enabled: false }
            },
        })

        this.human.draw.options.drawPoints = false;

        await this.human.load();
        await this.human.warmup();
        await this.detectionLoop();
    }

    setElement(videoElement) {
        this.videoElement = videoElement;
    }

    async detectionLoop () {
        await this.human.detect(this.videoElement)
        requestAnimationFrame(() => this.detectionLoop());
    }

    getFaceData () {
        const face = this.human.result.face[0];

        return {
            emotion: face.emotion,
            distance: face.distance,
            box: face.box,
            annotations: face.annotations,
        }
    }
}