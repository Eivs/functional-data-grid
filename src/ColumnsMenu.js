// @flow

import React from 'react'
import {List, Map} from 'immutable'
import Column from './Column'

type ColumnsMenuPropsType = {
  leftLockedColumns: List<Column>,
  freeColumns: List<Column>,
  rightLockedColumns: List<Column>,
  columnGroups: List<ColumnGroup>,
  enableColumnsShowAndHide: boolean,
  enableColumnsSorting: boolean,
  columnsVisibility: Map<string, boolean>,
  onColumnVisibilityChange: Function,
  onClose: () => void,
  columnsOrder: List<string>,
  onColumnsOrderChange: List<string> => void
}

export default class ColumnsMenu extends React.PureComponent<ColumnsMenuPropsType> {
  
  ref: ?HTMLDivElement

  static defaultProps = {
    enableColumnsShowAndHide: false,
    enableColumnsSorting: false,
    onColumnVisibilityChange: () => {},
    onColumsOrderChange: (columnsOrder: List<string>) => {},
    onClose: () => {}
  }

  constructor(props: ColumnsMenuPropsType) {
    super(props)
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true)
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }

  handleClickOutside = (event: Object) => {
    if (this.ref != null && ! this.ref.contains(event.target)) {
      this.props.onClose()
      event.stopPropagation()
    }
  }

  render = () => <div ref={ref => this.ref = ref} style={{ padding: '5px', backgroundColor: '#ddd', border: 'solid 1px #ccc', lineHeight: '26px', maxHeight: '500px', overflow: 'auto' }}>
    { this.props.leftLockedColumns.size > 0 && this.renderColumnEntries(this.props.leftLockedColumns) }
    { this.props.freeColumns.size > 0 && <div style={{ borderTop: 'solid 1px #bbb' }}>{ this.renderColumnEntries(this.props.freeColumns) }</div> }
    { this.props.rightLockedColumns.size > 0 && <div style={{ borderTop: 'solid 1px #bbb' }}>{ this.renderColumnEntries(this.props.rightLockedColumns) }</div> }
  </div>

  renderColumnEntries = (columns: List<Column>) => <div>{ columns.map((c, index) => this.renderColumnEntry(c, index)) }</div>

  renderColumnEntry = (c: Column, index: number) => {
    return <div key={index} draggable={this.props.enableColumnsSorting} onDragStart={this.onDragStart(c.id)} onDragOver={this.onDragOver} onDrop={this.onDrop(c.id)} style={{cursor: this.props.enableColumnsSorting ? 'pointer' : 'auto'}}>
      { this.props.enableColumnsSorting && <div style={{ display: 'inline-block', marginRight: '4px', verticalAlign: 'middle', color: '#999' }}>{ String.fromCodePoint(9776) }</div> }
      <div style={{ display: 'inline-block', verticalAlign: 'middle' }}>{ this.props.enableColumnsShowAndHide && <input type="checkbox" checked={this.props.columnsVisibility.get(c.id)} onChange={this.onColumnVisibilityChange(c.id)} style={{ margin: 0, verticalAlign: 'middle' }} /> } { c.title }</div>
    </div>
  }

  onDragOver = (event: Object) => {
    event.preventDefault()
  }
  
  onDragStart = (columnId: string) => (event: Object) => {
    event.dataTransfer.setData('columnId', columnId)
  }

  onDrop = (columnId: string) => (event: Object) => {
    let sourceColumnId = event.dataTransfer.getData('columnId')
    let targetColumnId = columnId
    this.props.onColumnsOrderChange(this.moveColumnBefore(sourceColumnId, targetColumnId))
    event.dataTransfer.clearData()
  }

  moveColumnBefore = (sourceColumnId: string, targetColumnId: string) => {
    let sourceColumnIndex = this.props.columnsOrder.findIndex(co => co === sourceColumnId)
    let columnsOrderWithoutSourceColumn = this.props.columnsOrder.delete(sourceColumnIndex)
    let targetColumnIndex = columnsOrderWithoutSourceColumn.findIndex(co => co === targetColumnId)
    return columnsOrderWithoutSourceColumn.insert(targetColumnIndex + (sourceColumnIndex > targetColumnIndex ? 0 : 1), sourceColumnId)
  }

  onColumnVisibilityChange = (columnId: string) => (event: Object) => {
    this.props.onColumnVisibilityChange(columnId, event.target.checked)
  }
}