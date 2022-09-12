var canvasSize = {
  width: window.innerWidth,
  height: window.innerHeight,
  depth: 1000,
  maxX: window.innerWidth/2,
  maxY: window.innerHeight/2
}
var config = {
  limits: {
    genesisRate: 50,
    maxParticles: 3000
  },
  size: {
    min: 5,
    max: 20,
    glow: 10
  },
  position: {
    x: 0,
    y: 0,
    z: 0
  },
  velocity: {
    x: {
      min: -5,
      max: 5
    },
    y: {
      min: -1,
      max: 5
    },
    z: {
      min: -10,
      max: 10
    }
  },
  acceleration: {
    x: 0,
    y: -0.2,
    z: -0.2
  },
  color: [// gradient over life
    {
      r: 0,
      g: 0,
      b: 255
    },
    {
      r: 255,
      g: 50,
      b: 0
    }
  ],
  alpha: 100
  
}
function setup() {
  createCanvas(canvasSize.width, canvasSize.height)
  particles = new ParticleEngine(config.limits.genesisRate, config.limits.maxParticles)
}

function draw() {
  background(0, 10, 25)
  fill(255);
  text("FPS: " + frameRate().toFixed(0), 10, 10);
  translate(canvasSize.width/2, canvasSize.height/2) // put origin in center
  particles.show()
}

class Particle {
  constructor (options) {
    this.options = options
    this.velocity = {
      x: random(this.options.velocity.x.min, this.options.velocity.x.max),
      y: random(this.options.velocity.y.min, this.options.velocity.y.max),
      z: random(this.options.velocity.z.min, this.options.velocity.z.max)
    }
    this.position = {
      x: () => {
        return this.options.position.x+(this.velocity.x*this.framesAlive)+((0.5)*this.options.acceleration.x*this.framesAlive*this.framesAlive)
      },
      y: () => {
        return this.options.position.y+(this.velocity.y*this.framesAlive)+((0.5)*this.options.acceleration.y*this.framesAlive*this.framesAlive)
      },
      z: () => {
        return this.options.position.z+(this.velocity.z*this.framesAlive)+((0.5)*this.options.acceleration.z*this.framesAlive*this.framesAlive)
      },
    }
    this.size = random(this.options.size.min, this.options.size.max)
    this.color = {
      r: () => {
        return lerp(this.options.color[0].r, this.options.color[1].r, this.framePercentage)
      },
      g: () => {
        return lerp(this.options.color[0].g, this.options.color[1].g, this.framePercentage)
      },
      b: () => {
        return lerp(this.options.color[0].b, this.options.color[1].b, this.framePercentage)
      },
      a: () => { return lerp(this.options.alpha, 0, this.framePercentage) }
    }
    this.framesToLive = null
    this.framesAlive = 0
    this.framePercentage = 0
  }
  setFramesToLive (frames) {
    this.framesToLive = frames
  }
  update () {
    this.framesAlive +=1
    this.framePercentage = this.framesAlive/this.framesToLive
  }
  show () {
    
    let depthFactor = 1+this.position.z()/canvasSize.depth

    // Draw Particle
    noStroke()
    fill(this.color.r(), this.color.g(), this.color.b(), this.color.a())
    ellipse(this.position.x(), this.position.y(), this.size*depthFactor)
  }
  finished () {
    // alpha has reached 0 or been alive too long or out of screen
    let outOfScreen = this.position.x() > canvasSize.maxX || this.position.x() < -canvasSize.maxX || this.position.y() > canvasSize.maxY || this.position.y() < -canvasSize.maxY
    let dead = this.color.a() < 0 || this.framesAlive >= this.framesToLive 
    return outOfScreen || dead
  }
}
class ParticleEngine {
  constructor (rate, maxParticles) {
    this.rate = rate
    this.maxParticles = maxParticles
    this.particles = []
  }
  generate () {
    // create New particles
    for (let i = 0; i<this.rate; i++){
      // push a clone of our particle
      let particle = new Particle(config)
      particle.setFramesToLive((this.maxParticles/this.rate)+1)
      this.particles.push(particle)
    }
  }
  show () {
    this.generate()
    // update and draw each particle
    for (let i = this.particles.length-1; i >= 0; i--) {// loop backwards in case we delete a particle
      let particle = this.particles[i]
      particle.update()
      particle.show()
      if (particle.finished()){
        // remove the old particle
        this.particles.splice(i, 1)
      }
    }
  }
}
