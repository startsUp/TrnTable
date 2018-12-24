import React, { Component } from 'react'
import '../../App.css'


const ListItem = props => (
    <div className='list-item'>
        <div className='list-icon'>
            <img src={props.iconURL}/>
        </div>
        <div className='list-content'>
            {props.content}
        </div>
        <div className='list-subcontent'>
            {props.subContent}
        </div>
    </div>
)

class List extends Component {
    render() {
        var list = null
        if(this.props.items){
            list = this.props.items.map((item) => {
                return(<ListItem key={item.id} iconURL={item.iconURL} content={item.content} subContent={item.subContent}/>)
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