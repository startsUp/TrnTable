import React, { Component } from 'react'
import '../../App.css'
import {ReactComponent as AddIcon} from '../../res/images/add.svg'
import {ReactComponent as AddedIcon} from '../../res/images/added.svg'

const ListItem = props => (
    <div className='list-item'>
        <div className='list-image'>
            <img className='list-item-image' src={props.item.iconURL}/>
        </div>
        <div className='list-content-container' onClick={props.contentClick}>
            <div className='list-content'>
                {props.item.content}   
            </div>
            <div className='list-subcontent'>
                {props.item.subContent}
            </div>
            
        </div>
        <div className='list-selection-container' id={props.selected ? 'list-selected' : ''}>
                <div className='list-icon-container' onClick={props.onToggle}>
                    {props.selected ? 
                        <AddedIcon id='list-icon-added'/> : 
                        <AddIcon id='list-icon'/>
                    }
                </div>
            </div>
        
    </div>
)

class List extends Component {
    state = {
        selected : [], 
    }
    handleToggle = value => {
        const { selected } = this.state
        const currentIndex = selected.indexOf(value)
        const newSelected = [...selected]
    
        if (currentIndex === -1) {
          newSelected.push(value)
        } else {
          newSelected.splice(currentIndex, 1)
        }
    
        this.setState({
          selected: newSelected,
        })
        this.props.updateTracks(newSelected)
    }
    render() {
        var list = null
        if(this.props.items.length > 0){
            list = this.props.items.map((item, value) => {
                var selected = this.state.selected.indexOf(value) !== -1 
                return(<ListItem key={item.id} 
                                 item={item} 
                                 type={this.props.type}
                                 selected={selected}
                                 onToggle={() => this.handleToggle(value)}
                                 contentClick={this.props.contentClick}/>)
            })
        }
        const emptyMessage = <div className='room-text-tip'>
                                {this.props.emptyMessage}
                            </div>
       
       
        return (
            <div className='list-container'>
                {list === null ? emptyMessage : list}
            </div>
        )
    }
}	
export default List