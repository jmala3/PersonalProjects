class Car{
    constructor(x,y,width,height, controlType, maxSpeed = 3){
        this.x=x;
        this.y=y;
        this.width=width;
        this.height=height;

        this.speed=0;
        this.acceleration=0.2; // This when holding up will increase the speed until maxspeed
        this.maxSpeed= maxSpeed; //we can call a car with this amount
        this.friction=0.05; //will be used to stop the car
        this.angle=0;
        this.damage = 0; //this will hold damage

        this.useBrain=controlType=="AI";


        if (controlType !== 'DUMMY') {
            this.sensor=new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
        }
        this.controls=new Controls(controlType);

        this.img = new Image();
        this.img.src = "car.png";

    }

    update(roadBorders,traffic){
        if(!this.damaged){ // damaged dont move
            this.#move();
            this.polygon=this.#createPolygon();
            this.damaged=this.#assessDamage(roadBorders,traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets=this.sensor.readings.map(
                s=>s==null?0:1-s.offset
            );
            const outputs=NeuralNetwork.feedForward(offsets,this.brain);

            if(this.useBrain){
                this.controls.forward=outputs[0];
                this.controls.left=outputs[1];
                this.controls.right=outputs[2];
                this.controls.reverse=outputs[3];
            }
        }
    }
    #assessDamage(roadBoarders, traffic) {
        for (let i = 0; i < roadBoarders.length; i++) {
            if (polysIntersect(this.polygon, roadBoarders[i])) { // check if edge of car intersect side of road
                return true;
            }

        }
        for (let i = 0; i < traffic.length; i++) { // checking if touching any traffic
            if (polysIntersect(this.polygon, traffic[i].polygon)) { // checking if any corners of car intersect traffic
                return true;
            }

        }
        return false;
    }

    #createPolygon(){ // Use this to create edges of the car
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x:this.x - Math.sin(this.angle - alpha) * rad,
            y:this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(this.angle + alpha) * rad,
            y:this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y:this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });
        return points;
    }

    #move(){
        if(this.controls.forward){
            this.speed+=this.acceleration; // speed is increased by factor of accelerator
        }
        if(this.controls.reverse){
            this.speed-=this.acceleration;
        }

        if(this.speed>this.maxSpeed){
            this.speed=this.maxSpeed;
        }
        if(this.speed<-this.maxSpeed/2){
            this.speed=-this.maxSpeed/2;
        }

        if(this.speed>0){
            this.speed-=this.friction;
        }
        if(this.speed<0){
            this.speed+=this.friction;
        }
        if(Math.abs(this.speed)<this.friction){
            this.speed=0;
        }

        if(this.speed!=0){
            const flip=this.speed>0?1:-1;
            if(this.controls.left){
                this.angle+=0.03*flip;
            }
            if(this.controls.right){
                this.angle-=0.03*flip;
            }
        }

        this.x-=Math.sin(this.angle)*this.speed; // makes it so the car won't gain speed when traveling at angle
        this.y-=Math.cos(this.angle)*this.speed; // so it does not break physics
    }

    draw(ctx, color, drawSensor = false){
        // ctx.save()
        // ctx.translate(this.x, this.y);
        // ctx.rotate(-this.angle);
        // ctx.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height);
        // ctx.restore();


        if (this.damaged) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = color;
        }

        ctx.beginPath()
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i  = 0; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();
        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}
