import React, { Component } from 'react'
import '../../App.css'
import { Slider, Direction } from 'react-player-controls'


const SliderBar = ({ direction, value, style }) => <div style={computedStylesHere} />
const SliderHandle = ({ direction, value, style }) => <div style={computedStylesHere} />
class ControlSlider extends Component {
    constructor(props){
        super(props)
        this.state = {
            value: this.props.value,
            enabled: this.props.enabled,
            direction: this.props.direction === 'horizontal' ?
                        Direction.HORIZONTAL : Direction.VERTICAL,
            lastValueEnd: 0,
            lastIntent: 0,
            lastValueStart: 0
        }
    }
    render(){
        return(
            <Slider
                isEnabled={this.state.isEnabled}
                direction={this.state.direction}
                onChange={newValue => this.setState(() => ({ value: newValue }))}
                onChangeStart={startValue => this.setState(() => ({ lastValueStart: startValue }))}
                onChangeEnd={endValue => this.setState(() => ({ lastValueEnd: endValue }))}
                onIntent={intent => this.setState(() => ({ lastIntent: intent }))}
                style={sliderStylesHere}
                >
                <SliderBar
                    direction={this.state.direction}
                    value={this.state.value}
                    style={{ background: this.state.isEnabled ? '#72d687' : '#878c88' }}
                />
                <SliderBar
                    direction={this.state.direction}
                    value={this.state.lastIntent}
                    style={{ background: 'rgba(0, 0, 0, 0.05)' }}
                />
                <SliderHandle
                    direction={this.state.direction}
                    value={this.state.value}
                    style={{ background: this.state.isEnabled ? '#72d687' : '#878c88' }}
                />
                </Slider>

        )
    }
}

export default ControlSlider
