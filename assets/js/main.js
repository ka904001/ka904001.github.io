class App {
    generateValues(numValues) {
        this.maxNum = numValues;
        this.values = {
            x: Array(numValues),
            y: Array(numValues),
            xAverage: Array(numValues),
            yAverage: Array(numValues),
            piApprox: Array(numValues),
        };
        let x;
        let y;
        let pi;
        let xAcc = 0.0;
        let yAcc = 0.0;
        let correctAcc = 0;
        for (let i = 1; i <= numValues; i++) {
            xAcc += (x = Math.random());
            yAcc += (y = Math.random());
            if (x * x + y * y < 1.0) {
                correctAcc++;
                pi = correctAcc / i;
            }
            this.values.x[i] = x;
            this.values.xAverage[i] = xAcc / i;
            this.values.y[i] = y;
            this.values.yAverage[i] = yAcc / i;
            this.values.piApprox[i] = 4 * pi;
        }
    };
    curNum() {
        return Math.round(this.curPercent / 100.0 * this.maxNum);
    };
    initStats() {
        this.statsOutput = {
            nDisplay: document.getElementById('n_display'),
            xAverage: document.getElementById('x_average'),
            xError: document.getElementById('x_error'),
            yAverage: document.getElementById('y_average'),
            yError: document.getElementById('y_error'),
            piApprox: document.getElementById('pi_approx'),
            piApproxError: document.getElementById('pi_approx_error'),
            piApproxRelError: document.getElementById('pi_approx_rel_error')
        };
        this.updateStats();
    }
    updateStats() {
        this.statsOutput.nDisplay.value = this.curNum();
        this.statsOutput.xAverage.innerText = this.values.xAverage[this.curNum()];
        this.statsOutput.xError.innerText = Math.abs(this.values.xAverage[this.curNum()] - 0.5);
        this.statsOutput.yAverage.innerText = this.values.yAverage[this.curNum()];
        this.statsOutput.yError.innerText = Math.abs(this.values.xAverage[this.curNum()] - 0.5);
        this.statsOutput.piApprox.innerText = this.values.piApprox[this.curNum()];
        this.statsOutput.piApproxError.innerText = Math.abs(this.values.piApprox[this.curNum()] - Math.PI);
        this.statsOutput.piApproxRelError.innerText = Math.abs(this.values.piApprox[this.curNum()] - Math.PI) / Math.PI;
    };
    initData() {
        this.data = [{
            x: this.values.x.slice(1, this.curNum()),
            y: this.values.y.slice(1, this.curNum()),
            mode: 'markers',
            type: 'scatter'
        }];
        let layout = {
            xaxis: {
                range: [0, 1.0]
            },
            yaxis: {
                range: [0, 1.0]
            },
            shapes: [{
                type: 'circle',
                xref: 'x',
                yref: 'y',
                x0: -1,
                y0: -1,
                x1: 1,
                y1: 1,
                line: {
                    color: 'rgba(50, 171, 96, 1)'
                }
            }]
        };
        let config = {
            responsive: true
        };
        this.updateStats();
        Plotly.newPlot('plotDiv', this.data, layout, config);
    };
    updateData() {
        this.data[0].x = this.values.x.slice(1, this.curNum());
        this.data[0].y = this.values.y.slice(1, this.curNum());
        this.updateStats();
        Plotly.redraw('plotDiv');
    };
    constructor(maxNum, curPercent) {
        this.generateValues(maxNum);
        this.initStats();
        // make input connection
        this.input = document.getElementById('limit_input');
        this.input.value = this.maxNum;
        this.button = document.getElementById('limit_button');
        this.button.addEventListener('click', (e) => {
            this.generateValues(this.input.value);
            this.updateData();
        });
        // make slider connection
        this.curPercent = curPercent;
        this.slider = document.getElementById('limit_slider');
        this.slider.value = this.curPercent;
        this.slider.addEventListener('change', (e) => {
            // update the plot
            this.curPercent = Number(this.slider.value);
            this.updateData();
        });
        this.initData();
    };
};

let app = new App(10000, 50);
