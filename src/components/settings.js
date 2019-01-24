import React, { Component } from 'react'
import '../App.css'
import './components.css'


export const DefaultHostSettings = [
    {id: 0, 
        desc: 'Delete the Session\'s Playlist from my spotify \
        account when I end the session.',
        name: 'keepSpotifyPlaylist',
        type: 'boolean',
        value: false,
        default: false},
    {id: 2,
    desc: 'Maximum Users that can join your session.', 
    type: 'input',
    name: 'guests',
    inputType: 'number', 
    min: 5,
    max: 300,  
    value: 50,
    default: 50},
]

export const newSettings = (settings) => {
    return DefaultHostSettings.map((setting, index) => {
        return{...setting, value:settings[index]}
    })

}

class InputSetting extends Component {
    handleChange = (event) =>{
        const {setting, settingChanged} = this.props
        settingChanged(setting.id, event.target.value)
    }
    render(){
        const {setting, value} = this.props
        return(
            <div className='setting-list-item'>
                <div className='setting-desc'>
                    {setting.desc}
                </div>
                <div>
                    {setting.inputType === 'number' && 
                    <input id='input-setting' type="number" 
                        min={setting.min} value={value}
                        onChange={this.handleChange}
                        max={setting.max} step="5"/>
                    }
                </div>
            </div>
        )
    }

}
class BoolSetting extends Component {
    handleChange = (event) =>{
        const {setting, settingChanged} = this.props
        settingChanged(setting.id, !this.props.value)
    }
    render(){
        const {setting} = this.props
        const inputID = `checkbox ${setting.id}`
        return(
            <div className='setting-list-item'>
            <div className='setting-desc'>
                {setting.desc}
            </div>
            <div>
                <label className="switch">
                    <input id={inputID} type="checkbox" defaultChecked={setting.value} 
                            onChange={this.handleChange}/>
                    <span className="slider round"></span>
                </label>
            </div>
        </div>
        )
    }
}

class DropdownSetting extends Component{
    handleChange = (event) =>{
        const {setting, settingChanged} = this.props
        settingChanged(setting.id, event.target.value)
    }
    render(){
        const {setting, value} = this.props
        return(
            <div className='setting-list-item'>
                <div className='setting-desc'>
                    {setting.desc}
                </div>
                <div>
                <select id='dropdown-select' value={value} onChange={this.handleChange}>
                    {setting.options.map((val,index)=>{
                        return(<option key={index}>{val}</option>)})
                    }
                </select>
                </div>

            </div>  
        )
    }
}

const settingComponent = (setting, value, callback) => {
    if(setting.type === 'dropdown')
        return(<DropdownSetting key={setting.id} value={value} settingChanged={callback} setting={setting}/>)
    else if(setting.type === 'boolean')
        return(<BoolSetting key={setting.id} value={value} settingChanged={callback} setting={setting}/>)
    else
        return(<InputSetting key={setting.id} value={value} settingChanged={callback} setting={setting}/>)
}

class Settings extends Component {
    constructor(props){
        super(props)
        this.state = {
            values: this.props.settings.map(setting=> setting.value),
            changesApplied: true
        }
    }
    componentWillUnmount = () => {
        this.props.updateSettings(this.state.values)
    }
    handleChange = (index, value) => {

        const newValues = this.state.values.map((v, i)=>{
            if(i === index)
                return value
            else
                return v
        })
        this.setState({values: newValues, changesApplied: false})
    }
    handleApply = async () => {
        await this.setState({changesApplied: true})
        this.props.updateSettings(this.state.values)
    }
    render(){

        const {settings, endSession, host} = this.props
        const {values, changesApplied} = this.state
        const buttonStyle = !changesApplied ? {marginRight: '1em'}:{}
        return(
            <div className='settings-container'>
                <div className='settings-window'>
                    <div className='settings'>
                        <div className='sidebar-context-title' id='context-title' style={{paddingTop: '1em'}}>
                            {host ? 'Settings': 'Leave Session'}
                        </div>
                        {host &&
                            <div className='settings-list'>
                                    {   
                                        settings.map((setting, index)=>{
                                            return(settingComponent(setting, values[index], this.handleChange))
                                        })
                                    }
                            </div>
                        }
                        <div className='settings-buttons-container' >
                        <div className='list-showmore' id='setting-end-button' onClick={endSession} style={buttonStyle}>
                            {host ? 'End Session' : 'Leave Session'}
                        </div>
                        {!changesApplied && 
                            <div className='list-showmore' id='setting-end-button' style={{marginLeft: '1em'}}
                                onClick={this.handleApply}>
                                Apply Settings
                            </div>
                        }
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
export default Settings


