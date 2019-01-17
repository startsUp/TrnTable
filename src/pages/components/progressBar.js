import React, { Component } from 'react'
import '../../App.css'

import { Direction, Slider } from 'react-player-controls'

const WHITE_SMOKE = '#eee'
const GRAY = '#878c88'
const GREEN = '#1ED660'

// A colored bar that will represent the current value
const SliderBar = ({ direction, value, style }) => (
  <div
    style={Object.assign({}, {
      position: 'absolute',
      background: GRAY,
      borderRadius: 4,
    }, direction === Direction.HORIZONTAL ? {
      top: 0,
      bottom: 0,
      left: 0,
      width: `${value * 100}%`,
    } : {
      right: 0,
      bottom: 0,
      left: 0,
      height: `${value * 100}%`,
    }, style)}
  />
)

// A handle to indicate the current value
const SliderHandle = ({ direction, value, style }) => (
  <div
    style={Object.assign({}, {
      position: 'absolute',
      width: 16,
      height: 16,
      background: GREEN,
      borderRadius: '100%',
      transform: 'scale(1)',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.3)',
      }
    }, direction === Direction.HORIZONTAL ? {
      top: 0,
      left: `${value * 100}%`,
      marginTop: -4,
      marginLeft: -8,
    } : {
      left: 0,
      bottom: `${value * 100}%`,
      marginBottom: -8,
      marginLeft: -4,
    }, style)}
  />
)

// A composite progress bar component
class ProgressBar extends Component{
  
    constructor(props){
        super(props)
        this.state = {
            value: this.props.value
        }
    }

    newValueSet = () => { 
        this.props.updateProgress(this.state.value)
    }
    render(){
        const {isEnabled, direction} = this.props
        const { value } = this.props
        return(
            <Slider
            isEnabled={isEnabled}
            direction={direction}
            onChange={newValue => this.setState({value: newValue})}
            onChangeEnd={this.newValueSet}
            style={{
                width: direction === Direction.HORIZONTAL ? 400 : 8,
                height: direction === Direction.HORIZONTAL ? 8 : 330,
                borderRadius: 4,
                background: WHITE_SMOKE,
                transition: direction === Direction.HORIZONTAL ? 'width 0.1s' : 'height 0.1s',
                cursor: isEnabled === true ? 'pointer' : 'default',
            }}
            >
            <SliderBar direction={direction} value={value} style={{ background: isEnabled ? GREEN : GRAY }} />
            <SliderHandle direction={direction} value={value} style={{ background: isEnabled ? GREEN : GRAY }} />
            </Slider>   
        )
    } 
}

export default ProgressBar 

