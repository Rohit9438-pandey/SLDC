import React from 'react';
import electricity1 from '../Images/Electricity1.jpg';
import electricity2 from '../Images/Electricity2.jpg';
import electron2 from '../Images/Electron2.jpg';
import bulb from '../Images/Bulb.avif';
import conductor from '../Images/Conductor.jpg';
import conductor1 from '../Images/Conductor1.jpg';



// Functional Component for the page
const ElectricityInfo = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' , backgroundColor:'#f4f4f4'}}>
      <h1 style ={{color: 'red' , fontSize:'2.5em' , textAlign:'center' , marginTop:'40px'}}>From Electrons to Electricity!</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
      <img 
        src={electricity1}
        alt="Electricity Illustration" 
        style={{ width: '40%', height: '20%', borderRadius: '8px', marginTop: '40px' }}
      />

    <img 
        src={electricity2}
        alt="Electricity Illustration" 
        style={{ width: '40%', height: '20%', borderRadius: '8px', marginTop: '40px' }}
      />
      </div>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2 style = {{color:'red' , textAlign:'center' ,fontSize:'2em' ,marginBottom:'10px' , textTransform:'upperCase' , paddingButtom:'5px'}}>What is Electricity?</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <img 
        src={electron2}
        alt="Electricity Illustration" 
        style={{ width: '40%', height: '20%', borderRadius: '8px', marginBottom: '20px' }}
      />

    <img 
        src={bulb}
        alt="Electricity Illustration" 
        style={{ width: '20%', height: '30%', borderRadius: '8px', marginBottom: '20px' }}
      />
  </div>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          All things are made up of very thin particles called atoms. Everything, from metals, wood, glass, water, and gases, is made of atoms. We cannot see atoms because they are very, very small. However, scientists have found out that even atoms are made up of smaller particles. One of the many types of particles in an atom is the electron.
        </p>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          We get electric current because of the movement of the electrons. So, current is the flow of electrons. You might imagine electrons traveling from one end of the wire to the other end and making a continuous flow, just like the flow of water in a pipe (though the two are not exactly identical).
        </p>
      </section>



      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2 style = {{color:'red' , textAlign:'center'}}>Conductors and Insulators</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <img 
        src={conductor} 
        alt="Electricity Illustration" 
        style={{ width: '30%', height: '30%', borderRadius: '8px', marginBottom: '20px' }}
      />
        

          <img 
        src={conductor1}
        alt="Electricity Illustration" 
        style={{ width: '40%', height: '30%', borderRadius: '8px', marginBottom: '20px' }}
      />

      </div>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          Some materials allow electricity to flow through them easily, some materials do not. The materials that allow electricity to flow through them easily are known as conductors. The materials through which it is difficult for electricity to flow are known as insulators or non-conductors.
        </p>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          Conductors are useful to us because they allow electricity to flow through them. However, sometimes we do not want electricity to flow, and so we have to use insulators to prevent the flow of electricity. For example, we use rubber or plastic insulators to cover electric wires to prevent electricity from flowing into our body. Otherwise, we would get an electric shock.
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2 style = {{color:'red' , textAlign:'center'}}>How to Turn Electricity On and Off</h2>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          We use electricity very often. For example, to work radios, fans, electric kettles, and to get light from bulbs. However, we do not want these devices to be 'on' all the time. We use a switch to turn electricity 'on' and 'off'. The switch's function is mainly to 'make' or 'break' the circuit, allowing electricity to flow (ON position) or stopping it (OFF position).
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2 style = {{color:'red' , textAlign:'center'}}>Other Ways to Obtain Electricity (Batteries)</h2>
        <h3>Dry Cell</h3>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          A dry cell is a type of primary battery that gives a steady current for a certain time, after which the current weakens and eventually stops. Once it’s used up, it's no longer useful.
        </p>

        <h3>Wet Cell</h3>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          The wet cell, also known as an accumulator, is a type of secondary battery. It contains liquid inside and can be recharged. When the current weakens, you can recharge the wet cell, and it becomes as good as new.
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2 style = {{color:'red' , textAlign:'center'}}>How is Electricity Produced (Generation of Electricity)</h2>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          Electricity is produced by generators, which are essentially big dynamos that can generate large amounts of electricity. Generators are located in power stations, where electricity is produced and then transmitted via cables to homes and offices, forming a closed circuit.
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2>Electricity Can Give Us Heat</h2>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          When electricity passes through a light bulb, it generates heat. Similarly, when electricity passes through an electric kettle's coiled wire, heat is produced, which then boils the water inside.
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2>Electricity Can Give Us Light</h2>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          Electricity can also be converted into light energy. In a bulb, electricity passes through a thin tungsten wire, making it hot enough to glow and produce light. Fluorescent lamps use much less electricity to produce the same amount of light, making them more efficient than tungsten bulbs.
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2>Electricity is a Form of Energy</h2>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          Electricity, heat, light, and magnetism are all different forms of energy. Electrical energy can be converted into light energy, heat energy, or magnetic energy. 
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2>Electricity Can Prove to Be Fatal Too</h2>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          While electricity is very useful, it can also be dangerous. Here are some safety tips:
          <ul style={{fontSize:'1.1em' ,lineHeight: '1.6' , marginLeft:'20px' , marginBottom:'20px'}}>
            <li style={{marginBottom:'10px' , fontWeight:'500'}}>Do not touch a bare wire from the main electrical circuit, as it may carry a live current.</li>
            <li style={{marginBottom:'10px' , fontWeight:'500'}}>Avoid climbing on lampposts with electric wires, as the metal can conduct electricity.</li>
            <li style={{marginBottom:'10px' , fontWeight:'500'}}>Do not push a needle through an electric wire.</li>
            <li style={{marginBottom:'10px' , fontWeight:'500'}}>Never try to repair electrical appliances yourself—leave it to a trained electrician.</li>
            <li style={{marginBottom:'10px' , fontWeight:'500'}}>Touching electrical appliances with wet hands is dangerous, as water can conduct electricity.</li>
          </ul>
        </p>
      </section>

      <section style={{marginBottom:'30px' , borderLeft:'5px solid #2a8d8a' , paddingLeft:'20px' , marginLeft:'10px'}}>
        <h2>Measurement of Electricity</h2>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          Electric current is measured in amperes (A), which is similar to water flowing through a pipe. The pressure pushing electricity along is measured in volts (V). For example, a torch battery is 1½ volts, a car battery is 6 or 12 volts, and household electricity is 240 volts.
        </p>
        <p style={{fontSize: '1.1em' , lineHeight:'1.6' , marginBottom:'15px' , textAlign:'justify'}}>
          Electricity usage is measured in kilowatt-hours (kWh). Watt is the unit of power, and a kilowatt-hour represents electrical energy supplied at a rate of 1,000 watts for 1 hour.
        </p>
      </section>
      
    </div>

    
  );
}

export default ElectricityInfo;
