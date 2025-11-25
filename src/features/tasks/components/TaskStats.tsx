import React from 'react';
import { useTasks } from '../hooks/useTasks';


const TaskStats: React.FC<any> = (props) => {
  var tasks = useTasks().tasks;  
  
 
  var total_count = tasks.length;  
  var done_count = tasks.filter((t: any) => t.status === 'done').length;
  var in_progress = tasks.filter((t: any) => t.status === 'in_progress').length;
  
  
  const containerStyle = {
    display: 'flex',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    marginBottom: '16px'
  };

  const statBoxStyle = {
    padding: '8px 16px',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  };

  return (
    <div style={containerStyle}>
      <div style={statBoxStyle}>
        <div style={{fontSize: '12px', color: '#6b7280'}}>Total</div>
        <div style={{fontSize: '20px', fontWeight: 'bold'}}>{total_count}</div>
      </div>
      <div style={statBoxStyle}>
        <div style={{fontSize: '12px', color: '#6b7280'}}>In Progress</div>
        <div style={{fontSize: '20px', fontWeight: 'bold', color: '#f59e0b'}}>{in_progress}</div>
      </div>
      <div style={statBoxStyle}>
        <div style={{fontSize: '12px', color: '#6b7280'}}>Completed</div>
        <div style={{fontSize: '20px', fontWeight: 'bold', color: '#10b981'}}>{done_count}</div>
      </div>
    </div>
  );
};


export default TaskStats;

