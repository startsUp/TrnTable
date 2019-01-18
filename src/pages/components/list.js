import React, { Component } from 'react'
import '../../App.css'
import {ReactComponent as AddIcon} from '../../res/images/add.svg'
import {ReactComponent as AddedIcon} from '../../res/images/added.svg'

const ListItem = props => (
    <div className='list-item'>
        <div className='list-image'>
            <img className='list-item-image' src={props.item.iconURL}/>
        </div>
        <div className='list-content-container' onClick={() => props.contentClick(props.item)}>
            <div className='list-content'>
                {props.item.content}   
            </div>
            <div className='list-subcontent'>
                {props.item.subContent}
            </div>
            
        </div>
        {props.selectable &&  //only display add icons if the list item are selectable
            <div className='list-selection-container' id={props.selected ? 'list-selected' : ''}>
                    <div className='list-icon-container' onClick={props.onToggle}>
                        {props.selected ? 
                            <AddedIcon id='list-icon-added'/> : 
                            <AddIcon id='list-icon'/>
                        }
                    </div>
            </div>
        }
    </div>
)

class List extends Component {
    state = {
        selected : [],
        itemsToShow: this.props.itemsToShow ? this.props.itemsToShow : -1, 
    }
    componentDidUpdate = (prevProps, prevState) => {
        
        
        if (prevProps.type !== this.props.type && prevState.selected.length !== 0)
        {
            prevProps.updateTracks(prevState.selected.slice())
            this.setState({selected: []})
        }
            
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

    handleShowMore = () => {
        this.setState({itemsToShow: this.state.itemsToShow * 2})
    }
    render() {
        var list = null
        const { itemsToShow } = this.state

        if(this.props.items.length > 0){
            list = this.props.items.map((item, value) => {
                if (itemsToShow !== -1 && value >= itemsToShow)
                    return 
                var selected = this.state.selected.indexOf(value) !== -1 
                return(<ListItem key={item.id} 
                                 item={item} 
                                 type={this.props.type}
                                 selectable={this.props.selectable}
                                 selected={selected}
                                 onToggle={() => this.handleToggle(value)}
                                 contentClick={this.props.contentClick}/>)
            })
        }
        const emptyMessage = <div className='heading'>
                                {this.props.emptyMessage}
                            </div>
       
       
        return (
            <div className='list-container' id={this.props.dark ? 'list-dark': 'list-no-bg'}>
                {list === null ? emptyMessage : list}
                {itemsToShow !== -1 && <div className='list-showmore' id='list-showmore-button'
                                onClick={this.handleShowMore}>Show More</div>}
            </div>
        )
    }
}	
export default List